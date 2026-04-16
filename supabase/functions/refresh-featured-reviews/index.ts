import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface FeaturedBusiness {
  business_id: string;
  businesses: {
    id: string;
    name: string;
    gbp_id: string;
  };
}

/**
 * Batch-refreshes Google reviews for active featured partners.
 *
 * Uses Google Places API (New) instead of Outscraper — reviews are included
 * for free in Place Details requests ($200/month free credit from Google).
 * For ~100 businesses this costs ~$2.50, fully covered by the free tier.
 *
 * Falls back to Outscraper if GOOGLE_PLACES_API_KEY is not set.
 *
 * Runs via pg_cron (every 3 days, with 60-day cache → each partner refreshed ~every 2 months).
 *
 * Body params (all optional):
 *   forceRefresh: boolean (default false) — ignore cache
 *   batchSize: number (default 15) — businesses per run
 *   cacheDays: number (default 60) — days before re-fetching
 */
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: optional CRON_SECRET check
    const CRON_SECRET = Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("authorization");
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get("token");
    const providedToken = authHeader?.replace("Bearer ", "") || tokenParam;

    if (CRON_SECRET && providedToken !== CRON_SECRET) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
    const OUTSCRAPER_API_KEY = Deno.env.get("OUTSCRAPER_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!GOOGLE_PLACES_API_KEY && !OUTSCRAPER_API_KEY) {
      throw new Error("Neither GOOGLE_PLACES_API_KEY nor OUTSCRAPER_API_KEY configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config missing");

    const useGoogle = !!GOOGLE_PLACES_API_KEY;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse body params
    let forceRefresh = false;
    let batchSize = 15;
    let cacheDays = 60;
    try {
      const body = await req.json();
      forceRefresh = body.forceRefresh ?? false;
      batchSize = body.batchSize ?? 15;
      cacheDays = body.cacheDays ?? 60;
    } catch {
      // defaults
    }

    // 1. Get active featured partners
    const { data: featured, error: featuredError } = await supabase
      .from("featured_slots")
      .select("business_id, businesses!inner(id, name, gbp_id, review_count)")
      .eq("status", "active")
      .not("business_id", "is", null);

    if (featuredError) throw new Error(`Failed to fetch featured slots: ${featuredError.message}`);
    if (!featured || featured.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No active featured partners", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deduplicate + skip businesses with 0 reviews on Google (nothing to fetch)
    const uniqueBusinesses = new Map<string, { id: string; name: string; gbp_id: string; review_count: number }>();
    for (const slot of featured as unknown as any[]) {
      const biz = slot.businesses;
      if (biz?.gbp_id && !uniqueBusinesses.has(biz.id) && (biz.review_count || 0) > 0) {
        uniqueBusinesses.set(biz.id, biz);
      }
    }

    // 2. Find stale businesses
    const cacheDate = new Date();
    cacheDate.setDate(cacheDate.getDate() - cacheDays);
    const businessIds = Array.from(uniqueBusinesses.keys());

    const freshIds = new Set<string>();
    if (!forceRefresh) {
      for (let i = 0; i < businessIds.length; i += 50) {
        const batch = businessIds.slice(i, i + 50);
        const { data: fresh } = await supabase
          .from("business_reviews")
          .select("business_id")
          .in("business_id", batch)
          .gte("fetched_at", cacheDate.toISOString());
        if (fresh) for (const r of fresh) freshIds.add(r.business_id);
      }
    }

    const toRefresh = businessIds.filter((id) => !freshIds.has(id)).slice(0, batchSize);
    const remaining = businessIds.filter((id) => !freshIds.has(id)).length - toRefresh.length;

    console.log(`Total: ${uniqueBusinesses.size}, fresh: ${freshIds.size}, batch: ${toRefresh.length}, remaining: ${remaining}, provider: ${useGoogle ? 'Google Places' : 'Outscraper'}`);

    if (toRefresh.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "All fresh", total: uniqueBusinesses.size, refreshed: 0, remaining: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Fetch reviews per business
    const results: Array<{ businessId: string; name: string; status: string; reviewCount?: number; error?: string }> = [];
    let successCount = 0;
    let errorCount = 0;

    for (let idx = 0; idx < toRefresh.length; idx++) {
      const businessId = toRefresh[idx];
      const biz = uniqueBusinesses.get(businessId)!;
      console.log(`[${idx + 1}/${toRefresh.length}] ${biz.name} (${biz.gbp_id})`);

      try {
        let reviews: Array<{
          author_name: string;
          author_image: string | null;
          rating: number;
          review_text: string;
          review_time: string;
          likes: number;
        }> = [];

        if (useGoogle) {
          // --- Google Places API (New) ---
          const res = await fetch(
            `https://places.googleapis.com/v1/places/${biz.gbp_id}?fields=reviews&languageCode=sv`,
            {
              headers: {
                "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY!,
                "X-Goog-FieldMask": "reviews",
              },
            }
          );

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Google Places ${res.status}: ${errText.substring(0, 200)}`);
          }

          const data = await res.json();

          if (data.reviews && Array.isArray(data.reviews)) {
            for (const r of data.reviews) {
              if (r.rating >= 4 && r.text?.text) {
                reviews.push({
                  author_name: r.authorAttribution?.displayName || "Anonym",
                  author_image: r.authorAttribution?.photoUri || null,
                  rating: r.rating,
                  review_text: r.text.text,
                  review_time: r.publishTime || "",
                  likes: 0,
                });
              }
            }
          }
        } else {
          // --- Outscraper fallback (reviewsLimit=5 to save credits) ---
          const params = new URLSearchParams({
            query: biz.gbp_id,
            reviewsLimit: "5",
            sort: "highest_rating",
            language: "sv",
            region: "SE",
            async: "false",
          });

          const res = await fetch(
            `https://api.app.outscraper.com/maps/reviews-v3?${params.toString()}`,
            { headers: { "X-API-KEY": OUTSCRAPER_API_KEY! } }
          );

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Outscraper ${res.status}: ${errText.substring(0, 200)}`);
          }

          const result = await res.json();
          if (result.data && Array.isArray(result.data)) {
            for (const place of result.data) {
              if (place.reviews_data && Array.isArray(place.reviews_data)) {
                for (const review of place.reviews_data) {
                  if (review.review_rating >= 4 && review.review_text) {
                    reviews.push({
                      author_name: review.author_title || review.author_name || "Anonym",
                      author_image: review.author_image || null,
                      rating: review.review_rating,
                      review_text: review.review_text,
                      review_time: review.review_datetime_utc || "",
                      likes: review.review_likes || 0,
                    });
                  }
                }
              }
            }
          }
        }

        // Keep top 5
        const topReviews = reviews
          .sort((a, b) => b.rating - a.rating || b.likes - a.likes)
          .slice(0, 5);

        if (topReviews.length > 0) {
          await supabase.from("business_reviews").delete().eq("business_id", businessId);
          const { error: insertError } = await supabase
            .from("business_reviews")
            .insert(topReviews.map((r) => ({
              business_id: businessId,
              author_name: r.author_name,
              author_image: r.author_image,
              rating: r.rating,
              review_text: r.review_text,
              review_time: r.review_time,
              likes: r.likes,
              fetched_at: new Date().toISOString(),
            })));
          if (insertError) throw new Error(`DB insert: ${insertError.message}`);
          results.push({ businessId, name: biz.name, status: "ok", reviewCount: topReviews.length });
          successCount++;
        } else {
          results.push({ businessId, name: biz.name, status: "no_reviews", reviewCount: 0 });
          successCount++;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Error for ${biz.name}:`, msg);
        results.push({ businessId, name: biz.name, status: "error", error: msg });
        errorCount++;
      }

      // Rate limit: Google is generous but still be polite
      if (idx < toRefresh.length - 1) {
        await sleep(useGoogle ? 200 : 1500);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        provider: useGoogle ? "google_places" : "outscraper",
        total: uniqueBusinesses.size,
        alreadyFresh: freshIds.size,
        processedThisBatch: toRefresh.length,
        remaining,
        successCount,
        errorCount,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in refresh-featured-reviews:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

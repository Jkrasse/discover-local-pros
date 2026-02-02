import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReviewsRequest {
  businessId: string; // Required: business ID for caching
  placeId?: string; // Google place ID (preferred, more accurate)
  query?: string; // Business name as fallback
  limit?: number;
  sort?: "newest" | "most_relevant" | "highest_rating" | "lowest_rating";
  forceRefresh?: boolean; // Force refresh from API
}

interface Review {
  author_name: string;
  author_image?: string;
  rating: number;
  text: string;
  time: string;
  likes?: number;
}

interface CachedReview {
  id: string;
  business_id: string;
  author_name: string;
  author_image: string | null;
  rating: number;
  review_text: string | null;
  review_time: string | null;
  likes: number;
  fetched_at: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OUTSCRAPER_API_KEY = Deno.env.get("OUTSCRAPER_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!OUTSCRAPER_API_KEY) {
      throw new Error("OUTSCRAPER_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration is missing");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { businessId, placeId, query, limit = 5, sort = "highest_rating", forceRefresh = false }: ReviewsRequest = await req.json();

    if (!businessId) {
      return new Response(
        JSON.stringify({ error: "businessId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prefer placeId, fallback to query
    const searchQuery = placeId || query;

    if (!searchQuery) {
      return new Response(
        JSON.stringify({ error: "placeId or query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching reviews for business: ${businessId}, query: ${searchQuery}`);

    // Check for cached reviews (less than 30 days old)
    if (!forceRefresh) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: cachedReviews, error: cacheError } = await supabase
        .from("business_reviews")
        .select("*")
        .eq("business_id", businessId)
        .gte("fetched_at", thirtyDaysAgo.toISOString())
        .order("rating", { ascending: false })
        .limit(limit);

      if (!cacheError && cachedReviews && cachedReviews.length > 0) {
        console.log(`Returning ${cachedReviews.length} cached reviews for business ${businessId}`);
        
        const reviews: Review[] = cachedReviews.map((r: CachedReview) => ({
          author_name: r.author_name,
          author_image: r.author_image || undefined,
          rating: r.rating,
          text: r.review_text || "",
          time: r.review_time || "",
          likes: r.likes,
        }));

        return new Response(
          JSON.stringify({
            success: true,
            reviews,
            totalFound: cachedReviews.length,
            cached: true,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`No valid cache found, fetching from Outscraper API...`);

    // Use the reviews-v3 endpoint with async=false for synchronous results
    const params = new URLSearchParams({
      query: searchQuery,
      reviewsLimit: String(limit),
      sort: sort,
      language: "sv",
      region: "SE",
      async: "false", // Wait for results synchronously
    });

    const response = await fetch(
      `https://api.app.outscraper.com/maps/reviews-v3?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "X-API-KEY": OUTSCRAPER_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Outscraper API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Outscraper API error: ${response.status}`, details: errorText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    console.log("Outscraper reviews response:", JSON.stringify(result).substring(0, 1000));

    // Parse reviews from the response
    const reviews: Review[] = [];
    
    if (result.data && Array.isArray(result.data)) {
      for (const business of result.data) {
        if (business.reviews_data && Array.isArray(business.reviews_data)) {
          for (const review of business.reviews_data) {
            // Only include reviews with 4+ stars for "top reviews"
            if (review.review_rating >= 4 && review.review_text) {
              reviews.push({
                author_name: review.author_title || review.autor_name || review.author_name || "Anonym",
                author_image: review.author_image || review.autor_image,
                rating: review.review_rating,
                text: review.review_text || "",
                time: review.review_datetime_utc || review.review_timestamp || "",
                likes: review.review_likes,
              });
            }
          }
        }
      }
    }

    // Sort by rating (highest first) and take top N
    const topReviews = reviews
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);

    console.log(`Found ${reviews.length} reviews, returning top ${topReviews.length}`);

    // Save reviews to cache (delete old ones first, then insert new)
    if (topReviews.length > 0) {
      // Delete old reviews for this business
      const { error: deleteError } = await supabase
        .from("business_reviews")
        .delete()
        .eq("business_id", businessId);

      if (deleteError) {
        console.error("Error deleting old reviews:", deleteError);
      }

      // Insert new reviews
      const reviewsToInsert = topReviews.map((r) => ({
        business_id: businessId,
        author_name: r.author_name,
        author_image: r.author_image || null,
        rating: r.rating,
        review_text: r.text,
        review_time: r.time,
        likes: r.likes || 0,
        fetched_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase
        .from("business_reviews")
        .insert(reviewsToInsert);

      if (insertError) {
        console.error("Error caching reviews:", insertError);
      } else {
        console.log(`Cached ${reviewsToInsert.length} reviews for business ${businessId}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reviews: topReviews,
        totalFound: reviews.length,
        cached: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in fetch-reviews:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

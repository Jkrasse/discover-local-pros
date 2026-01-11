import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OutscraperBusiness {
  place_id?: string;
  name?: string;
  phone?: string;
  site?: string;
  full_address?: string;
  city?: string;
  rating?: number;
  reviews?: number;
  latitude?: number;
  longitude?: number;
  working_hours?: Record<string, string>;
  category?: string;
  subtypes?: string[];
  description?: string;
  about?: string;
  photos?: string[];
  logo?: string;
}

interface ImportResult {
  name: string;
  status: "created" | "updated" | "skipped" | "error";
  message?: string;
  city?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/[ö]/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeCity(cityName: string): string {
  return cityName
    .toLowerCase()
    .trim()
    .replace(/[åä]/g, "a")
    .replace(/[ö]/g, "o");
}

serve(async (req) => {
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

    const { requestId, serviceId } = await req.json();

    if (!requestId || !serviceId) {
      return new Response(
        JSON.stringify({ error: "requestId and serviceId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check status from Outscraper
    const statusResponse = await fetch(`https://api.app.outscraper.com/requests/${requestId}`, {
      headers: { "X-API-KEY": OUTSCRAPER_API_KEY },
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error("Outscraper status error:", statusResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `Failed to check status: ${statusResponse.status}` }),
        { status: statusResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const statusResult = await statusResponse.json();
    console.log("Outscraper status:", statusResult.status);

    // If not finished, return status
    if (statusResult.status !== "Success") {
      return new Response(
        JSON.stringify({
          status: statusResult.status,
          message: "Scraping is still in progress. Please check again later.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Results are ready - process them
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch cities for matching
    const { data: cities, error: citiesError } = await supabase.from("cities").select("*");
    if (citiesError) throw citiesError;

    const cityMap = new Map<string, { id: string; name: string }>();
    for (const city of cities || []) {
      cityMap.set(normalizeCity(city.name), { id: city.id, name: city.name });
    }

    const results: ImportResult[] = [];
    const affectedCities = new Set<string>();

    // Outscraper returns an array of arrays (one per query)
    const allData = statusResult.data || [];

    for (const queryResults of allData) {
      if (!Array.isArray(queryResults)) continue;

      for (const business of queryResults as OutscraperBusiness[]) {
        if (!business.name || !business.place_id) {
          results.push({
            name: business.name || "Unknown",
            status: "skipped",
            message: "Missing required fields (name or place_id)",
          });
          continue;
        }

        // Match city
        let matchedCity: { id: string; name: string } | undefined;
        if (business.city) {
          const normalizedBusinessCity = normalizeCity(business.city);
          matchedCity = cityMap.get(normalizedBusinessCity);

          // Try partial match if exact match fails
          if (!matchedCity) {
            for (const [key, value] of cityMap.entries()) {
              if (normalizedBusinessCity.includes(key) || key.includes(normalizedBusinessCity)) {
                matchedCity = value;
                break;
              }
            }
          }
        }

        if (!matchedCity) {
          results.push({
            name: business.name,
            status: "skipped",
            message: `City not found: ${business.city}`,
            city: business.city,
          });
          continue;
        }

        affectedCities.add(matchedCity.id);

        // Prepare categories
        const categories: string[] = [];
        if (business.category) categories.push(business.category);
        if (business.subtypes) categories.push(...business.subtypes);

        // Prepare business data
        const businessData = {
          gbp_id: business.place_id,
          name: business.name,
          slug: generateSlug(business.name),
          phone: business.phone || null,
          website: business.site || null,
          address: business.full_address || null,
          city_id: matchedCity.id,
          rating: business.rating || null,
          review_count: business.reviews || 0,
          lat: business.latitude || null,
          lng: business.longitude || null,
          opening_hours: business.working_hours || null,
          categories: categories.length > 0 ? categories : null,
          description: business.description || business.about || null,
          images: business.photos?.slice(0, 5) || null,
          is_active: true,
          verified: false,
        };

        try {
          // Check if business exists
          const { data: existing } = await supabase
            .from("businesses")
            .select("id")
            .eq("gbp_id", business.place_id)
            .maybeSingle();

          let businessId: string;

          if (existing) {
            // Update existing
            const { error: updateError } = await supabase
              .from("businesses")
              .update(businessData)
              .eq("id", existing.id);

            if (updateError) throw updateError;
            businessId = existing.id;

            results.push({
              name: business.name,
              status: "updated",
              city: matchedCity.name,
            });
          } else {
            // Insert new
            const { data: inserted, error: insertError } = await supabase
              .from("businesses")
              .insert(businessData)
              .select("id")
              .single();

            if (insertError) throw insertError;
            businessId = inserted.id;

            results.push({
              name: business.name,
              status: "created",
              city: matchedCity.name,
            });
          }

          // Create service coverage
          await supabase.from("business_service_coverage").upsert(
            {
              business_id: businessId,
              service_id: serviceId,
              city_id: matchedCity.id,
              is_primary: true,
            },
            { onConflict: "business_id,service_id,city_id" }
          );

        } catch (err) {
          console.error("Error importing business:", business.name, err);
          results.push({
            name: business.name,
            status: "error",
            message: err instanceof Error ? err.message : "Unknown error",
            city: matchedCity.name,
          });
        }
      }
    }

    // Create featured slots for affected cities and assign random business
    for (const cityId of affectedCities) {
      const { data: existingSlot } = await supabase
        .from("featured_slots")
        .select("id, business_id, status")
        .eq("city_id", cityId)
        .eq("service_id", serviceId)
        .maybeSingle();

      if (!existingSlot) {
        // No slot exists - create one with a random business from this import
        const { data: coverages } = await supabase
          .from("business_service_coverage")
          .select("business_id")
          .eq("city_id", cityId)
          .eq("service_id", serviceId);

        let randomBusinessId: string | null = null;
        if (coverages && coverages.length > 0) {
          const randomIndex = Math.floor(Math.random() * coverages.length);
          randomBusinessId = coverages[randomIndex].business_id;
        }

        await supabase.from("featured_slots").insert({
          city_id: cityId,
          service_id: serviceId,
          business_id: randomBusinessId,
          status: randomBusinessId ? "active" : "pending",
          is_placeholder: true,
        });
      } else if (!existingSlot.business_id || existingSlot.status === "pending") {
        // Slot exists but has no business or is pending - assign a random one
        const { data: coverages } = await supabase
          .from("business_service_coverage")
          .select("business_id")
          .eq("city_id", cityId)
          .eq("service_id", serviceId);

        if (coverages && coverages.length > 0) {
          const randomIndex = Math.floor(Math.random() * coverages.length);
          const randomBusinessId = coverages[randomIndex].business_id;

          await supabase
            .from("featured_slots")
            .update({
              business_id: randomBusinessId,
              status: "active",
              is_placeholder: true,
            })
            .eq("id", existingSlot.id);
        }
      }
    }

    // Summary
    const summary = {
      total: results.length,
      created: results.filter((r) => r.status === "created").length,
      updated: results.filter((r) => r.status === "updated").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      errors: results.filter((r) => r.status === "error").length,
      citiesAffected: affectedCities.size,
    };

    return new Response(
      JSON.stringify({
        status: "completed",
        summary,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in outscraper-results:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

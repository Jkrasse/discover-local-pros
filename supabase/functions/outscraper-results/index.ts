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
  // Enrichment: Emails And Contacts
  emails_and_contacts?: {
    emails?: string[];
    phones?: string[];
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  // Enrichment: Company Insights
  company_insights?: {
    employees_range?: string;
    founded_year?: number;
    industry?: string;
  };
  // Enrichment: Emails Validator
  emails_validator?: Array<{
    email: string;
    is_valid: boolean;
  }>;
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

async function getOrCreateCity(
  supabase: any,
  cityName: string,
  cityMap: Map<string, { id: string; name: string }>
): Promise<{ id: string; name: string; isNew: boolean } | null> {
  if (!cityName) return null;

  const normalizedName = normalizeCity(cityName);

  // Try exact match first
  let matchedCity = cityMap.get(normalizedName);

  // Try partial match if exact match fails
  if (!matchedCity) {
    for (const [key, value] of cityMap.entries()) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        matchedCity = value;
        break;
      }
    }
  }

  // If city found, return it
  if (matchedCity) {
    return { ...matchedCity, isNew: false };
  }

  // City not found - create it
  const slug = generateSlug(cityName);

  const { data: newCity, error } = await supabase
    .from("cities")
    .insert({
      name: cityName.trim(),
      slug: slug,
      region: null,
      population: null,
    })
    .select("id, name")
    .single();

  if (error) {
    console.error("Failed to create city:", cityName, error);
    return null;
  }

  // Add to cache for future matches in this import
  cityMap.set(normalizedName, { id: newCity.id, name: newCity.name });
  console.log("Created new city:", newCity.name);

  return { id: newCity.id, name: newCity.name, isNew: true };
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
    let newCitiesCreated = 0;

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

        // Match or create city
        const matchedCity = await getOrCreateCity(supabase, business.city || '', cityMap);

        if (!matchedCity) {
          results.push({
            name: business.name,
            status: "skipped",
            message: `Could not match or create city: ${business.city}`,
            city: business.city,
          });
          continue;
        }

        if (matchedCity.isNew) {
          newCitiesCreated++;
        }

        affectedCities.add(matchedCity.id);

        // Prepare categories
        const categories: string[] = [];
        if (business.category) categories.push(business.category);
        if (business.subtypes) categories.push(...business.subtypes);

        // Extract enrichment data
        const enrichedEmails = business.emails_and_contacts?.emails || [];
        const primaryEmail = enrichedEmails[0] || null;
        const emailValidated = business.emails_validator?.some(e => e.is_valid) || false;

        // Prepare business data with enrichments
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
          // Enrichment: Emails And Contacts
          email: primaryEmail,
          emails: enrichedEmails.length > 0 ? enrichedEmails : null,
          facebook: business.emails_and_contacts?.facebook || null,
          instagram: business.emails_and_contacts?.instagram || null,
          linkedin: business.emails_and_contacts?.linkedin || null,
          twitter: business.emails_and_contacts?.twitter || null,
          youtube: business.emails_and_contacts?.youtube || null,
          // Enrichment: Company Insights
          employee_count: business.company_insights?.employees_range || null,
          founded_year: business.company_insights?.founded_year || null,
          industry: business.company_insights?.industry || null,
          // Enrichment: Emails Validator
          email_verified: emailValidated,
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
      newCitiesCreated,
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

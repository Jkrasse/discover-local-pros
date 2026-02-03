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
  website?: string;
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
  emails_and_contacts?: {
    emails?: string[];
    phones?: string[];
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  company_insights?: {
    employees_range?: string;
    founded_year?: number;
    industry?: string;
  };
  emails_validator?: Array<{ email: string; is_valid: boolean }>;
  emails?: string[];
  email?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  employees?: string;
  employees_range?: string;
  founded_year?: number;
  industry?: string;
  email_1?: string;
  email_2?: string;
  email_3?: string;
  "email_1.emails_validator.status"?: string;
  "email_2.emails_validator.status"?: string;
  "company_insights.employees_range"?: string;
  "company_insights.founded_year"?: number;
  "company_insights.industry"?: string;
  "company_insights.description"?: string;
  [key: string]: unknown;
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

// Match city against the allowed cities list (cities from scrape input)
function matchAllowedCity(
  cityName: string,
  allowedCityMap: Map<string, { id: string; name: string }>
): { id: string; name: string } | null {
  if (!cityName) return null;

  const normalizedName = normalizeCity(cityName);

  // Try exact match first
  let matchedCity = allowedCityMap.get(normalizedName);

  // Try partial match if exact match fails - but only if the allowed city is contained in the business city
  // This handles cases like "Hisings Backa" which should NOT match "Göteborg"
  // But "Stockholm" business city should match "Stockholm" in allowed list
  if (!matchedCity) {
    for (const [key, value] of allowedCityMap.entries()) {
      // Only match if the normalized names are very similar
      if (normalizedName === key || normalizedName.startsWith(key + " ") || key.startsWith(normalizedName + " ")) {
        matchedCity = value;
        break;
      }
    }
  }

  if (matchedCity) {
    return matchedCity;
  }

  // City not in allowed list - skip it
  console.log(`City not in allowed list, skipping: "${cityName}"`);
  return null;
}

// Create cities from the input list if they don't exist
async function ensureCitiesExist(
  supabase: any,
  cityNames: string[]
): Promise<Map<string, { id: string; name: string }>> {
  const cityMap = new Map<string, { id: string; name: string }>();
  
  for (const cityName of cityNames) {
    const trimmedName = cityName.trim();
    if (!trimmedName) continue;
    
    const normalizedName = normalizeCity(trimmedName);
    
    // Check if city already exists
    const { data: existing } = await supabase
      .from("cities")
      .select("id, name")
      .ilike("name", trimmedName)
      .maybeSingle();
    
    if (existing) {
      cityMap.set(normalizedName, { id: existing.id, name: existing.name });
      console.log(`City already exists: ${existing.name}`);
    } else {
      // Create the city
      const { data: newCity, error } = await supabase
        .from("cities")
        .insert({
          name: trimmedName,
          slug: generateSlug(trimmedName),
          region: null,
          population: null,
        })
        .select("id, name")
        .single();
      
      if (error) {
        console.error(`Failed to create city ${trimmedName}:`, error);
      } else {
        cityMap.set(normalizedName, { id: newCity.id, name: newCity.name });
        console.log(`Created new city: ${newCity.name}`);
      }
    }
  }
  
  return cityMap;
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

    const { requestId, serviceId, cities: inputCities } = await req.json();

    if (!requestId || !serviceId) {
      return new Response(
        JSON.stringify({ error: "requestId and serviceId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate cities input - this is the list of cities from the scrape form
    const allowedCities: string[] = Array.isArray(inputCities) ? inputCities.filter(c => typeof c === 'string' && c.trim()) : [];

    // Check status from Outscraper
    // Outscraper returns `results_location` on the search response (often on api.outscraper.cloud).
    // Using api.outscraper.cloud first avoids DNS issues seen with api.app.outscraper.com in some runtimes.
    const statusUrls = [
      `https://api.outscraper.cloud/requests/${requestId}`,
      `https://api.app.outscraper.com/requests/${requestId}`,
    ];

    let statusResponse: Response | null = null;
    let lastStatusFetchError: unknown = null;

    for (const url of statusUrls) {
      try {
        statusResponse = await fetch(url, {
          headers: { "X-API-KEY": OUTSCRAPER_API_KEY },
        });
        break;
      } catch (err) {
        lastStatusFetchError = err;
        console.error("Outscraper status fetch failed for URL:", url, err);
      }
    }

    if (!statusResponse) {
      const msg =
        lastStatusFetchError instanceof Error
          ? lastStatusFetchError.message
          : String(lastStatusFetchError);
      throw new Error(`Failed to reach Outscraper status endpoint: ${msg}`);
    }

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
          status: statusResult.status === "Pending" ? "Pending" : statusResult.status,
          message: "Scraping is still in progress. Please check again later.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Results are ready - process them
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Create cities from the input list (the cities the user specified in the scrape form)
    // These are the ONLY cities that will have landing pages and businesses
    let allowedCityMap: Map<string, { id: string; name: string }>;
    
    if (allowedCities.length > 0) {
      console.log(`Creating/ensuring ${allowedCities.length} cities from input list:`, allowedCities);
      allowedCityMap = await ensureCitiesExist(supabase, allowedCities);
      console.log(`Allowed cities map has ${allowedCityMap.size} entries`);
    } else {
      // Fallback to existing behavior if no cities provided (shouldn't happen in normal flow)
      console.log("No cities provided in request, falling back to existing cities in database");
      const { data: cities, error: citiesError } = await supabase.from("cities").select("*");
      if (citiesError) throw citiesError;
      
      allowedCityMap = new Map<string, { id: string; name: string }>();
      for (const city of cities || []) {
        allowedCityMap.set(normalizeCity(city.name), { id: city.id, name: city.name });
      }
    }

    const results: ImportResult[] = [];
    const affectedCities = new Set<string>();
    

    // Outscraper returns an array of arrays (one per query)
    const allData = statusResult.data || [];

    // === DETAILED LOGGING: Understand what Outscraper returned ===
    const queryArrayCount = Array.isArray(allData) ? allData.length : 0;
    const perQueryCounts: number[] = [];
    let totalRawResults = 0;

    if (Array.isArray(allData)) {
      for (let i = 0; i < allData.length; i++) {
        const queryResults = allData[i];
        const count = Array.isArray(queryResults) ? queryResults.length : 0;
        perQueryCounts.push(count);
        totalRawResults += count;
      }
    }

    console.log("=== OUTSCRAPER DATA ANALYSIS ===");
    console.log(`Total queries returned: ${queryArrayCount}`);
    console.log(`Total raw items: ${totalRawResults}`);
    console.log(`Per-query counts: ${JSON.stringify(perQueryCounts)}`);
    console.log("================================");

    // Track seen business IDs to avoid processing duplicates within this import
    const seenGbpIds = new Set<string>();
    let skipReason = {
      noName: 0,
      noCity: 0,
      duplicateInBatch: 0,
    };

    for (let queryIdx = 0; queryIdx < allData.length; queryIdx++) {
      const queryResults = allData[queryIdx];
      if (!Array.isArray(queryResults)) {
        console.log(`Query ${queryIdx}: Not an array, skipping`);
        continue;
      }

      console.log(`Query ${queryIdx}: Processing ${queryResults.length} items`);

      for (const business of queryResults as OutscraperBusiness[]) {
        // Debug: Log first few businesses from each query to see data shape
        if (results.length < 3) {
          console.log(`=== SAMPLE BUSINESS (query ${queryIdx}, item ${results.length}) ===`);
          console.log(JSON.stringify({
            name: business.name,
            place_id: business.place_id,
            city: business.city,
            full_address: business.full_address,
            phone: business.phone,
            website: business.website || business.site,
            rating: business.rating,
            reviews: business.reviews,
          }, null, 2));
        }

        // Skip if no name
        if (!business.name) {
          skipReason.noName++;
          continue;
        }

        // Generate gbp_id - use place_id if available, otherwise create a deterministic synthetic ID
        let gbpId = business.place_id;
        if (!gbpId) {
          const nameSlug = generateSlug(business.name);
          const citySlug = generateSlug(business.city || "unknown");
          const phoneHash = (business.phone || "").replace(/\D/g, "").slice(-8) || "";
          const websiteHash = business.website || business.site
            ? generateSlug(business.website || business.site || "").slice(0, 12)
            : "";
          const addressHash = business.full_address
            ? generateSlug(business.full_address).slice(0, 12)
            : "";
          const coordsHash =
            typeof business.latitude === "number" && typeof business.longitude === "number"
              ? `${business.latitude.toFixed(4).replace(/\./g, "")}_${business.longitude.toFixed(4).replace(/\./g, "")}`
              : "";
          const identifier = phoneHash || websiteHash || addressHash || coordsHash || "na";
          gbpId = `synthetic_${nameSlug}_${citySlug}_${identifier}`;
        }

        // Skip duplicates within this batch (same business from multiple query variants)
        if (seenGbpIds.has(gbpId)) {
          skipReason.duplicateInBatch++;
          continue;
        }
        seenGbpIds.add(gbpId);

        // Match city against allowed cities only (from the scrape input list)
        const matchedCity = matchAllowedCity(business.city || "", allowedCityMap);

        if (!matchedCity) {
          skipReason.noCity++;
          results.push({
            name: business.name,
            status: "skipped",
            message: `City not in allowed list: ${business.city}`,
            city: business.city,
          });
          continue;
        }

        affectedCities.add(matchedCity.id);

        // Prepare categories
        const categories: string[] = [];
        if (business.category) categories.push(business.category);
        if (business.subtypes) categories.push(...business.subtypes);

        // Extract enrichment data (may be empty if enrichment was skipped)
        const enrichedEmails: string[] = [];
        if (business.email_1) enrichedEmails.push(business.email_1);
        if (business.email_2) enrichedEmails.push(business.email_2);
        if (business.email_3) enrichedEmails.push(business.email_3);
        
        if (enrichedEmails.length === 0) {
          if (business.emails_and_contacts?.emails?.length) {
            enrichedEmails.push(...business.emails_and_contacts.emails);
          } else if (business.emails?.length) {
            enrichedEmails.push(...business.emails);
          } else if (business.email) {
            enrichedEmails.push(business.email);
          }
        }
        const primaryEmail = enrichedEmails[0] || null;
        
        const emailValidated = 
          business["email_1.emails_validator.status"] === "VALID" ||
          business.emails_validator?.some(e => e.is_valid) || 
          false;

        const facebook = business.emails_and_contacts?.facebook || business.facebook || null;
        const instagram = business.emails_and_contacts?.instagram || business.instagram || null;
        const linkedin = business.emails_and_contacts?.linkedin || business.linkedin || null;
        const twitter = business.emails_and_contacts?.twitter || business.twitter || null;
        const youtube = business.emails_and_contacts?.youtube || business.youtube || null;

        const employeeCount = 
          (business["company_insights.employees_range"] as string) ||
          business.company_insights?.employees_range || 
          business.employees_range || 
          business.employees || 
          null;
        const foundedYear = 
          (business["company_insights.founded_year"] as number) ||
          business.company_insights?.founded_year || 
          business.founded_year || 
          null;
        const industry = 
          (business["company_insights.industry"] as string) ||
          business.company_insights?.industry || 
          business.industry || 
          null;

        // Prepare business data
        const businessData = {
          gbp_id: gbpId,
          name: business.name,
          slug: generateSlug(business.name),
          phone: business.phone || null,
          website: business.website || business.site || null,
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
          email: primaryEmail,
          emails: enrichedEmails.length > 0 ? enrichedEmails : null,
          facebook,
          instagram,
          linkedin,
          twitter,
          youtube,
          employee_count: employeeCount,
          founded_year: foundedYear,
          industry,
          email_verified: emailValidated,
        };

        try {
          // Check if business exists (by gbp_id)
          const { data: existing } = await supabase
            .from("businesses")
            .select("id, city_id")
            .eq("gbp_id", gbpId)
            .maybeSingle();

          let businessId: string;

          if (existing) {
            // Business exists - update non-geographic data only
            const { city_id: _unusedCityId, ...updateData } = businessData;
            
            const { error: updateError } = await supabase
              .from("businesses")
              .update(updateData)
              .eq("id", existing.id);

            if (updateError) throw updateError;
            businessId = existing.id;

            const isNewCityForBusiness = existing.city_id !== matchedCity.id;

            results.push({
              name: business.name,
              status: "updated",
              message: isNewCityForBusiness 
                ? `Also added coverage for ${matchedCity.name}` 
                : undefined,
              city: matchedCity.name,
            });
          } else {
            // Insert new business
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

          // Create service coverage for this city
          await supabase.from("business_service_coverage").upsert(
            {
              business_id: businessId,
              service_id: serviceId,
              city_id: matchedCity.id,
              is_primary: !existing,
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

    // Log skip reasons
    console.log("=== SKIP REASONS ===");
    console.log(`No name: ${skipReason.noName}`);
    console.log(`No city: ${skipReason.noCity}`);
    console.log(`Duplicate in batch: ${skipReason.duplicateInBatch}`);
    console.log("====================");

    // Create featured slots for affected cities
    for (const cityId of affectedCities) {
      const { data: existingSlot } = await supabase
        .from("featured_slots")
        .select("id, business_id, status")
        .eq("city_id", cityId)
        .eq("service_id", serviceId)
        .maybeSingle();

      if (!existingSlot) {
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
      skippedNoCityInDb: skipReason.noCity,
      rawItemsFromOutscraper: totalRawResults,
      duplicatesFiltered: skipReason.duplicateInBatch,
    };

    console.log("=== FINAL SUMMARY ===");
    console.log(JSON.stringify(summary, null, 2));
    console.log("=====================");

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

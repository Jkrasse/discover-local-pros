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
  website?: string; // Outscraper returns website in this field
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
  // Enrichment: Emails And Contacts (nested structure)
  emails_and_contacts?: {
    emails?: string[];
    phones?: string[];
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  // Enrichment: Company Insights (nested structure)
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
  // Alternative flat field names from Outscraper
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
  // Flat email fields (email_1, email_2, email_3 format)
  email_1?: string;
  email_2?: string;
  email_3?: string;
  "email_1.emails_validator.status"?: string;
  "email_2.emails_validator.status"?: string;
  // Dot-notation company insights fields
  "company_insights.employees_range"?: string;
  "company_insights.founded_year"?: number;
  "company_insights.industry"?: string;
  "company_insights.description"?: string;
  // Index signature for dynamic dot-notation access
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
        // Debug: Log first business to see actual data structure
        if (results.length === 0) {
          console.log("=== SAMPLE BUSINESS DATA (first) ===");
          console.log(JSON.stringify(business, null, 2));
          console.log("=== ENRICHMENT FIELDS CHECK ===");
          console.log({
            // Nested structures
            emails_and_contacts: business.emails_and_contacts,
            company_insights: business.company_insights,
            emails_validator: business.emails_validator,
            // Flat fields
            flat_emails: business.emails,
            flat_email: business.email,
            flat_facebook: business.facebook,
            flat_linkedin: business.linkedin,
            flat_employees: business.employees,
            flat_employees_range: business.employees_range,
            flat_founded_year: business.founded_year,
            flat_industry: business.industry,
            // Numbered email fields (Outscraper format)
            email_1: business.email_1,
            email_2: business.email_2,
            email_3: business.email_3,
            "email_1.validator_status": business["email_1.emails_validator.status"],
            // Dot-notation company insights
            "company_insights.employees_range": business["company_insights.employees_range"],
            "company_insights.founded_year": business["company_insights.founded_year"],
            "company_insights.industry": business["company_insights.industry"],
          });
        }

        // Generate synthetic gbp_id if missing but we have enough data
        let gbpId = business.place_id;
        if (!gbpId && business.name && (business.phone || business.city)) {
          gbpId = `synthetic_${generateSlug(business.name)}_${generateSlug(business.city || '')}_${(business.phone || '').replace(/\D/g, '')}`;
          console.log(`Generated synthetic ID for "${business.name}": ${gbpId}`);
        }

        if (!business.name) {
          console.log(`SKIPPED: No name provided`, {
            hasPlaceId: !!business.place_id,
            hasCity: !!business.city,
            hasPhone: !!business.phone,
          });
          results.push({
            name: "Unknown",
            status: "skipped",
            message: "Missing business name",
          });
          continue;
        }

        if (!gbpId) {
          console.log(`SKIPPED: "${business.name}" - No place_id and insufficient data to generate ID`, {
            hasCity: !!business.city,
            hasPhone: !!business.phone,
            hasWebsite: !!business.website,
          });
          results.push({
            name: business.name,
            status: "skipped",
            message: "Missing place_id and insufficient data for synthetic ID",
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

        // Extract enrichment data - prioritize flat email_1/email_2/email_3 format
        const enrichedEmails: string[] = [];
        if (business.email_1) enrichedEmails.push(business.email_1);
        if (business.email_2) enrichedEmails.push(business.email_2);
        if (business.email_3) enrichedEmails.push(business.email_3);
        
        // Fallback to alternative formats if no numbered emails found
        if (enrichedEmails.length === 0) {
          if (business.emails_and_contacts?.emails && business.emails_and_contacts.emails.length > 0) {
            enrichedEmails.push(...business.emails_and_contacts.emails);
          } else if (business.emails && business.emails.length > 0) {
            enrichedEmails.push(...business.emails);
          } else if (business.email) {
            enrichedEmails.push(business.email);
          }
        }
        const primaryEmail = enrichedEmails[0] || null;
        
        // Check email validation status - support both formats
        const emailValidated = 
          business["email_1.emails_validator.status"] === "VALID" ||
          business.emails_validator?.some(e => e.is_valid) || 
          false;

        // Social media - check both nested and flat structure
        const facebook = business.emails_and_contacts?.facebook || business.facebook || null;
        const instagram = business.emails_and_contacts?.instagram || business.instagram || null;
        const linkedin = business.emails_and_contacts?.linkedin || business.linkedin || null;
        const twitter = business.emails_and_contacts?.twitter || business.twitter || null;
        const youtube = business.emails_and_contacts?.youtube || business.youtube || null;

        // Company insights - check dot-notation first, then nested, then flat
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

        // Prepare business data with enrichments
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
          // Enrichment: Emails
          email: primaryEmail,
          emails: enrichedEmails.length > 0 ? enrichedEmails : null,
          // Enrichment: Social Media
          facebook,
          instagram,
          linkedin,
          twitter,
          youtube,
          // Enrichment: Company Insights
          employee_count: employeeCount,
          founded_year: foundedYear,
          industry,
          // Enrichment: Emails Validator
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
            // Business exists - update non-geographic data only to support multi-city
            // Keep the original city_id to preserve the "primary" city
            const { city_id: _unusedCityId, ...updateData } = businessData;
            
            const { error: updateError } = await supabase
              .from("businesses")
              .update(updateData)
              .eq("id", existing.id);

            if (updateError) throw updateError;
            businessId = existing.id;

            // Check if this is a new city for this business
            const isNewCityForBusiness = existing.city_id !== matchedCity.id;

            results.push({
              name: business.name,
              status: "updated",
              message: isNewCityForBusiness 
                ? `Also added coverage for ${matchedCity.name} (business exists in another city)` 
                : undefined,
              city: matchedCity.name,
            });

            if (isNewCityForBusiness) {
              console.log(`Business "${business.name}" exists in another city, adding coverage for ${matchedCity.name}`);
            }
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

          // Always create service coverage for this city (supports multi-city businesses)
          // is_primary is only true if this is the first/original city for the business
          await supabase.from("business_service_coverage").upsert(
            {
              business_id: businessId,
              service_id: serviceId,
              city_id: matchedCity.id,
              is_primary: !existing, // Only primary if this is a new business
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

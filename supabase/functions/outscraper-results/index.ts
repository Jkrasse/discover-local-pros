import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OutscraperReview {
  author_title?: string;
  autor_name?: string;
  author_name?: string;
  author_image?: string;
  autor_image?: string;
  review_rating?: number;
  review_text?: string;
  review_datetime_utc?: string;
  review_timestamp?: string;
  review_likes?: number;
}

interface OutscraperBusiness {
  place_id?: string;
  name?: string;
  phone?: string;
  site?: string;
  website?: string;
  // Address fields - Outscraper uses different field names in different contexts
  full_address?: string;
  address?: string;
  street?: string;
  street_address?: string;
  postal_code?: string;
  zip?: string;
  city?: string;
  state?: string;
  country?: string;
  rating?: number;
  reviews?: number;
  reviews_data?: OutscraperReview[];
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

interface ProcessedBusiness {
  gbpId: string;
  businessData: Record<string, unknown>;
  cityId: string;
  cityName: string;
  originalName: string;
  reviews?: OutscraperReview[];
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

// Stockholm area suburbs and districts
const stockholmArea = new Set([
  "hägersten", "sundbyberg", "solna", "bromma", "kista", "spånga", "hässelby",
  "vällingby", "enskede", "farsta", "skärholmen", "södermalm", "östermalm",
  "vasastan", "norrmalm", "kungsholmen", "lidingö", "nacka", "huddinge",
  "tyresö", "täby", "danderyd", "järfälla", "upplands väsby", "vallentuna",
  "norrtälje", "haninge", "botkyrka", "södertälje", "sigtuna", "sollentuna",
  "åkersberga", "gustavsberg", "älvsjö", "bandhagen", "liljeholmen", "telefonplan",
  "hornstull", "mariatorget", "medborgarplatsen", "skanstull", "gullmarsplan",
  "johanneshov", "hammarby sjöstad", "hammarby", "bagarmossen", "skarpnäck",
  "björkhagen", "hammarbyhöjden", "midsommarkransen", "aspudden", "gröndal",
  "hägersten-liljeholmen", "årsta", "globen", "enskededalen", "stureby",
  "hägerstensåsen", "fruängen", "västertorp", "mälarhöjden", "axelsberg"
]);

// Göteborg area suburbs and districts
const goteborgArea = new Set([
  "hisingen", "hisings backa", "angered", "bergsjön", "kortedala", "gamlestaden",
  "örgryte", "härlanda", "majorna", "linné", "linnéstaden", "masthugget",
  "kungsladugård", "frölunda", "västra frölunda", "högsbo", "sisjön",
  "mölndal", "partille", "kungsbacka", "kungälv", "ale", "lerum",
  "torslanda", "lundby", "backa", "brunnsbo", "biskopsgården", "tolered",
  "kyrkbyn", "brämaregården", "rambergsstaden", "eriksberg", "lindholmen",
  "lundbyvassen", "olskroken", "redbergslid", "bagaregården", "utby",
  "kålltorp", "lunden", "olofstorp", "agnesberg", "surte", "bohus"
]);

// Malmö area suburbs and districts
const malmoArea = new Set([
  "limhamn", "bunkeflo", "hyllie", "fosie", "oxie", "husie", "kirseberg",
  "rosengård", "västra hamnen", "ribersborg", "möllevången", "sofielund",
  "södervärn", "triangeln", "davidshall", "rörsjöstaden", "slottsstaden",
  "värnhem", "burlöv", "lomma", "staffanstorp", "svedala", "vellinge",
  "arlöv", "åkarp", "bjärred", "bunkeflostrand", "tygelsjö", "oxie"
]);

// Match city against the allowed cities list (cities from scrape input)
// Businesses from suburbs/nearby areas are assigned to the main city in the list
function matchAllowedCity(
  cityName: string,
  allowedCityMap: Map<string, { id: string; name: string }>
): { id: string; name: string } | null {
  if (!cityName) return null;

  const normalizedName = normalizeCity(cityName);

  // Try exact match first
  let matchedCity = allowedCityMap.get(normalizedName);
  if (matchedCity) {
    return matchedCity;
  }

  // Try partial match - check if business city contains or is contained in an allowed city
  for (const [key, value] of allowedCityMap.entries()) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }

  // Check if this is a suburb/district of a major city in the allowed list
  // Stockholm suburbs
  if (stockholmArea.has(normalizedName) && allowedCityMap.has("stockholm")) {
    console.log(`Mapping suburb "${cityName}" to Stockholm`);
    return allowedCityMap.get("stockholm")!;
  }

  // Göteborg suburbs
  if (goteborgArea.has(normalizedName) && allowedCityMap.has("goteborg")) {
    console.log(`Mapping suburb "${cityName}" to Göteborg`);
    return allowedCityMap.get("goteborg")!;
  }

  // Malmö suburbs
  if (malmoArea.has(normalizedName) && allowedCityMap.has("malmo")) {
    console.log(`Mapping suburb "${cityName}" to Malmö`);
    return allowedCityMap.get("malmo")!;
  }

  // If we have exactly one city in the allowed list, map all businesses to it
  // This is useful for scraping a single city where businesses might report nearby locations
  if (allowedCityMap.size === 1) {
    const singleCity = Array.from(allowedCityMap.values())[0];
    console.log(`Mapping unmatched city "${cityName}" to single allowed city: ${singleCity.name}`);
    return singleCity;
  }

  // City not in allowed list and not a known suburb - skip it
  console.log(`City "${cityName}" not in allowed list and not a known suburb, skipping`);
  return null;
}

// Create cities from the input list if they don't exist
async function ensureCitiesExist(
  supabase: any,
  cityNames: string[]
): Promise<Map<string, { id: string; name: string }>> {
  const cityMap = new Map<string, { id: string; name: string }>();
  
  // Fetch all existing cities in one query
  const { data: existingCities } = await supabase
    .from("cities")
    .select("id, name, slug");
  
  const existingByName = new Map<string, { id: string; name: string }>();
  for (const city of (existingCities || []) as Array<{ id: string; name: string; slug: string }>) {
    existingByName.set(normalizeCity(city.name), { id: city.id, name: city.name });
  }
  
  const citiesToCreate: Array<{ name: string; slug: string }> = [];
  
  for (const cityName of cityNames) {
    const trimmedName = cityName.trim();
    if (!trimmedName) continue;
    
    const normalizedName = normalizeCity(trimmedName);
    
    if (existingByName.has(normalizedName)) {
      const existing = existingByName.get(normalizedName)!;
      cityMap.set(normalizedName, existing);
      console.log(`City already exists: ${existing.name}`);
    } else {
      citiesToCreate.push({
        name: trimmedName,
        slug: generateSlug(trimmedName),
      });
    }
  }
  
  // Batch insert new cities
  if (citiesToCreate.length > 0) {
    const { data: newCities, error } = await supabase
      .from("cities")
      .insert(citiesToCreate as any)
      .select("id, name");
    
    if (error) {
      console.error("Failed to batch create cities:", error);
    } else {
      for (const city of (newCities || []) as Array<{ id: string; name: string }>) {
        cityMap.set(normalizeCity(city.name), { id: city.id, name: city.name });
        console.log(`Created new city: ${city.name}`);
      }
    }
  }
  
  return cityMap;
}

// Process a single business from Outscraper response
function processBusiness(
  business: OutscraperBusiness,
  allowedCityMap: Map<string, { id: string; name: string }>,
  seenGbpIds: Set<string>,
  skipReason: { noName: number; noCity: number; duplicateInBatch: number }
): ProcessedBusiness | null {
  // Skip if no name
  if (!business.name) {
    skipReason.noName++;
    return null;
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
    return null;
  }
  seenGbpIds.add(gbpId);

  // Match city against allowed cities only (from the scrape input list)
  const matchedCity = matchAllowedCity(business.city || "", allowedCityMap);

  if (!matchedCity) {
    skipReason.noCity++;
    return null;
  }

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

  // Extract address from various possible field names
  // Outscraper uses different field names: full_address, address, street, street_address
  const extractedAddress = 
    business.full_address || 
    business.address ||
    business.street_address ||
    (business.street && business.city 
      ? `${business.street}, ${business.postal_code || business.zip || ''} ${business.city}`.trim().replace(/,\s*$/, '')
      : null) ||
    null;

  // Prepare business data
  const businessData = {
    gbp_id: gbpId,
    name: business.name,
    slug: generateSlug(business.name),
    phone: business.phone || null,
    website: business.website || business.site || null,
    address: extractedAddress,
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

  return {
    gbpId,
    businessData,
    cityId: matchedCity.id,
    cityName: matchedCity.name,
    originalName: business.name,
    reviews: business.reviews_data || [],
  };
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
    let totalRawResults = 0;

    if (Array.isArray(allData)) {
      for (let i = 0; i < allData.length; i++) {
        const queryResults = allData[i];
        const count = Array.isArray(queryResults) ? queryResults.length : 0;
        totalRawResults += count;
      }
    }

    console.log("=== OUTSCRAPER DATA ANALYSIS ===");
    console.log(`Total queries returned: ${queryArrayCount}`);
    console.log(`Total raw items: ${totalRawResults}`);
    console.log("================================");

    // Track seen business IDs to avoid processing duplicates within this import
    const seenGbpIds = new Set<string>();
    const skipReason = {
      noName: 0,
      noCity: 0,
      duplicateInBatch: 0,
    };

    // PHASE 1: Process all businesses and collect them for batch operations
    // First collect all businesses, then apply per-city limit
    const allProcessedBusinesses: ProcessedBusiness[] = [];

    for (let queryIdx = 0; queryIdx < allData.length; queryIdx++) {
      const queryResults = allData[queryIdx];
      if (!Array.isArray(queryResults)) {
        console.log(`Query ${queryIdx}: Not an array, skipping`);
        continue;
      }

      console.log(`Query ${queryIdx}: Processing ${queryResults.length} items`);

      // Log the first business in each query to debug field names
      if (queryIdx === 0 && queryResults.length > 0) {
        const sampleBusiness = queryResults[0] as OutscraperBusiness;
        console.log(`=== SAMPLE BUSINESS DATA (first item from query 0) ===`);
        console.log(`Name: ${sampleBusiness.name}`);
        console.log(`full_address: ${sampleBusiness.full_address}`);
        console.log(`address: ${sampleBusiness.address}`);
        console.log(`street: ${sampleBusiness.street}`);
        console.log(`street_address: ${sampleBusiness.street_address}`);
        console.log(`city: ${sampleBusiness.city}`);
        console.log(`postal_code: ${sampleBusiness.postal_code}`);
        console.log(`phone: ${sampleBusiness.phone}`);
        console.log(`All keys: ${Object.keys(sampleBusiness).join(', ')}`);
        console.log(`=======================================================`);
      }

      for (const business of queryResults as OutscraperBusiness[]) {
        const processed = processBusiness(business, allowedCityMap, seenGbpIds, skipReason);
        if (processed) {
          allProcessedBusinesses.push(processed);
        }
      }
    }

    console.log(`Total deduplicated businesses before city limit: ${allProcessedBusinesses.length}`);

    // PHASE 1.5: Apply per-city limit of 20 businesses max
    const MAX_BUSINESSES_PER_CITY = 20;
    const businessCountPerCity = new Map<string, number>();
    const processedBusinesses: ProcessedBusiness[] = [];
    let skippedDueToLimit = 0;

    for (const processed of allProcessedBusinesses) {
      const currentCount = businessCountPerCity.get(processed.cityId) || 0;
      
      if (currentCount < MAX_BUSINESSES_PER_CITY) {
        processedBusinesses.push(processed);
        businessCountPerCity.set(processed.cityId, currentCount + 1);
        affectedCities.add(processed.cityId);
      } else {
        skippedDueToLimit++;
      }
    }

    console.log(`Applied per-city limit (max ${MAX_BUSINESSES_PER_CITY}): kept ${processedBusinesses.length}, skipped ${skippedDueToLimit}`);

    // PHASE 2: Batch lookup existing businesses by gbp_id
    const gbpIds = processedBusinesses.map((b) => b.gbpId);
    const existingBusinessByGbpId = new Map<
      string,
      { id: string; city_id: string; slug: string; gbp_id: string | null }
    >();

    // Batch fetch in chunks of 500 (Supabase limit for IN queries)
    const BATCH_SIZE = 500;
    for (let i = 0; i < gbpIds.length; i += BATCH_SIZE) {
      const batchIds = gbpIds.slice(i, i + BATCH_SIZE);
      const { data: existingBatch } = await supabase
        .from("businesses")
        .select("id, gbp_id, city_id, slug")
        .in("gbp_id", batchIds);

      for (const biz of existingBatch || []) {
        if (biz.gbp_id) {
          existingBusinessByGbpId.set(biz.gbp_id, {
            id: biz.id,
            city_id: biz.city_id,
            slug: biz.slug,
            gbp_id: biz.gbp_id,
          });
        }
      }
    }

    // PHASE 2.25: Also lookup existing businesses by (slug, city_id)
    // This prevents batch insert failures when gbp_id changes between scrapes (synthetic ids) but slug+city is the same.
    const slugs = processedBusinesses
      .map((p) => String((p.businessData as any)?.slug || "").trim())
      .filter(Boolean);
    const cityIds = [...new Set(processedBusinesses.map((p) => p.cityId))];

    const existingBusinessBySlugCity = new Map<
      string,
      { id: string; city_id: string; slug: string; gbp_id: string | null }
    >();

    const slugKey = (slug: string, cityId: string) => `${slug}::${cityId}`;

    // Fetch in chunks to avoid URL limits
    for (let i = 0; i < slugs.length; i += BATCH_SIZE) {
      const slugBatch = slugs.slice(i, i + BATCH_SIZE);
      const { data: existingSlugBatch } = await supabase
        .from("businesses")
        .select("id, gbp_id, city_id, slug")
        .in("slug", slugBatch)
        .in("city_id", cityIds);

      for (const biz of existingSlugBatch || []) {
        existingBusinessBySlugCity.set(slugKey(biz.slug, biz.city_id), {
          id: biz.id,
          city_id: biz.city_id,
          slug: biz.slug,
          gbp_id: biz.gbp_id,
        });
      }
    }

    console.log(
      `Found ${existingBusinessByGbpId.size} existing businesses by gbp_id and ${existingBusinessBySlugCity.size} by (slug, city)`
    );

    // PHASE 3: Separate businesses into inserts and updates
    const toInsert: Array<Record<string, unknown>> = [];
    const toUpdate: Array<{
      gbpId: string;
      data: Record<string, unknown>;
      existingId: string;
    }> = [];
    const businessToGbpId = new Map<ProcessedBusiness, string>();

    for (const processed of processedBusinesses) {
      businessToGbpId.set(processed, processed.gbpId);
      const processedSlug = String((processed.businessData as any)?.slug || "");
      const existingByGbp = existingBusinessByGbpId.get(processed.gbpId);
      const existingBySlugCity = existingBusinessBySlugCity.get(
        slugKey(processedSlug, processed.cityId)
      );
      const existing = existingByGbp || existingBySlugCity;

      if (existing) {
        // Update existing - don't change city_id
        const { city_id: _unused, ...updateDataRaw } = processed.businessData as Record<
          string,
          unknown
        >;

        const updateData: Record<string, unknown> = { ...updateDataRaw };

        // Don't overwrite existing gbp_id unless it's missing
        if (existing.gbp_id) {
          delete updateData.gbp_id;
        }

        // Never wipe address with null/undefined
        if (updateData.address == null) {
          delete updateData.address;
        }

        toUpdate.push({
          gbpId: processed.gbpId,
          data: updateData,
          existingId: existing.id,
        });
        results.push({
          name: processed.originalName,
          status: "updated",
          message: existing.city_id !== processed.cityId 
            ? `Also added coverage for ${processed.cityName}` 
            : undefined,
          city: processed.cityName,
        });
      } else {
        toInsert.push(processed.businessData);
      }
    }

    // PHASE 4: Batch insert new businesses
    const insertedBusinessMap = new Map<string, string>(); // gbp_id -> id

    if (toInsert.length > 0) {
      console.log(`Batch inserting ${toInsert.length} new businesses...`);
      
      // Insert in batches of 100
      for (let i = 0; i < toInsert.length; i += 100) {
        const batch = toInsert.slice(i, i + 100);
        const { data: inserted, error: insertError } = await supabase
          .from("businesses")
          .insert(batch)
          .select("id, gbp_id");

        if (insertError) {
          console.error("Batch insert error:", insertError);
          // Mark all in batch as errors
          for (const biz of batch) {
            results.push({
              name: biz.name as string,
              status: "error",
              message: insertError.message,
              city: processedBusinesses.find(p => p.gbpId === biz.gbp_id)?.cityName,
            });
          }
        } else {
          for (const biz of inserted || []) {
            insertedBusinessMap.set(biz.gbp_id, biz.id);
            const processed = processedBusinesses.find(p => p.gbpId === biz.gbp_id);
            results.push({
              name: processed?.originalName || "Unknown",
              status: "created",
              city: processed?.cityName,
            });
          }
        }
      }
    }

    // PHASE 5: Batch update existing businesses
    if (toUpdate.length > 0) {
      console.log(`Updating ${toUpdate.length} existing businesses...`);
      
      // Updates need to be done individually due to different data per record
      // But we can do them concurrently in small batches
      const updatePromises = toUpdate.map(async ({ data, existingId }) => {
        const { error } = await supabase
          .from("businesses")
          .update(data)
          .eq("id", existingId);
        return { existingId, error };
      });

      // Execute updates with concurrency limit of 10
      const updateChunks = [];
      for (let i = 0; i < updatePromises.length; i += 10) {
        const chunk = updatePromises.slice(i, i + 10);
        updateChunks.push(Promise.all(chunk));
      }
      
      for (const chunk of updateChunks) {
        const chunkResults = await chunk;
        for (const result of chunkResults) {
          if (result.error) {
            console.error(`Update error for ${result.existingId}:`, result.error);
          }
        }
      }
    }

    // PHASE 6: Create service coverage records in batch
    const coverageRecords: Array<{
      business_id: string;
      service_id: string;
      city_id: string;
      is_primary: boolean;
    }> = [];

    const resolveExistingId = (processed: ProcessedBusiness) => {
      const processedSlug = String((processed.businessData as any)?.slug || "");
      return (
        existingBusinessByGbpId.get(processed.gbpId)?.id ||
        existingBusinessBySlugCity.get(slugKey(processedSlug, processed.cityId))?.id ||
        null
      );
    };

    for (const processed of processedBusinesses) {
      const existingId = resolveExistingId(processed);
      const businessId = existingId || insertedBusinessMap.get(processed.gbpId);

      if (businessId) {
        coverageRecords.push({
          business_id: businessId,
          service_id: serviceId,
          city_id: processed.cityId,
          is_primary: !existingId,
        });
      }
    }

    if (coverageRecords.length > 0) {
      console.log(`Upserting ${coverageRecords.length} coverage records...`);
      
      // Batch upsert in chunks of 100
      for (let i = 0; i < coverageRecords.length; i += 100) {
        const batch = coverageRecords.slice(i, i + 100);
        await supabase
          .from("business_service_coverage")
          .upsert(batch, { onConflict: "business_id,service_id,city_id" });
      }
    }

    // PHASE 6.5: Save reviews for imported businesses
    console.log("=== PHASE 6.5: Saving reviews ===");
    let totalReviewsSaved = 0;
    
    const reviewRecords: Array<{
      business_id: string;
      author_name: string;
      author_image: string | null;
      rating: number;
      review_text: string | null;
      review_time: string | null;
      likes: number;
      fetched_at: string;
    }> = [];

    for (const processed of processedBusinesses) {
      const existingId = resolveExistingId(processed);
      const businessId = existingId || insertedBusinessMap.get(processed.gbpId);

      if (businessId && processed.reviews && processed.reviews.length > 0) {
        // Filter to only include reviews with 4+ stars
        const topReviews = processed.reviews
          .filter(r => r.review_rating && r.review_rating >= 4 && r.review_text)
          .slice(0, 5); // Max 5 reviews per business

        for (const review of topReviews) {
          reviewRecords.push({
            business_id: businessId,
            author_name: review.author_title || review.autor_name || review.author_name || "Anonym",
            author_image: review.author_image || review.autor_image || null,
            rating: review.review_rating || 5,
            review_text: review.review_text || null,
            review_time: review.review_datetime_utc || review.review_timestamp || null,
            likes: review.review_likes || 0,
            fetched_at: new Date().toISOString(),
          });
        }
      }
    }

    if (reviewRecords.length > 0) {
      console.log(`Saving ${reviewRecords.length} reviews...`);
      
      // Get unique business IDs from review records
      const businessIdsWithReviews = [...new Set(reviewRecords.map(r => r.business_id))];
      
      // Delete existing reviews for these businesses (to replace with fresh data)
      for (let i = 0; i < businessIdsWithReviews.length; i += 100) {
        const batch = businessIdsWithReviews.slice(i, i + 100);
        await supabase
          .from("business_reviews")
          .delete()
          .in("business_id", batch);
      }

      // Insert new reviews in batches
      for (let i = 0; i < reviewRecords.length; i += 100) {
        const batch = reviewRecords.slice(i, i + 100);
        const { error: insertError } = await supabase
          .from("business_reviews")
          .insert(batch);
        
        if (insertError) {
          console.error("Error inserting reviews:", insertError);
        } else {
          totalReviewsSaved += batch.length;
        }
      }
      
      console.log(`Successfully saved ${totalReviewsSaved} reviews`);
    } else {
      console.log("No reviews to save (reviews may not be included in scrape results)");
    }

    // Log skip reasons
    console.log("=== SKIP REASONS ===");
    console.log(`No name: ${skipReason.noName}`);
    console.log(`No city: ${skipReason.noCity}`);
    console.log(`Duplicate in batch: ${skipReason.duplicateInBatch}`);
    console.log("====================");


    // PHASE 7: Handle featured slots
    // IMPORTANT: Featured partner must be chosen PER CITY (not globally), and must belong to that city.
    // We reuse the same partner across sub-services within the same city for consistency.
    // Fetch all sub-services for this main service
    const { data: subServices } = await supabase
      .from("services")
      .select("id")
      .eq("parent_service_id", serviceId);

    const allServiceIds = [serviceId, ...(subServices || []).map(s => s.id)];
    console.log(`Creating featured slots for ${allServiceIds.length} services (main + ${(subServices || []).length} sub-services)`);

    // Build a lookup of business IDs imported/updated in THIS run, grouped per city.
    // This lets us select a city-local partner without extra DB lookups.
    const businessIdsByCity = new Map<string, string[]>();
    for (const processed of processedBusinesses) {
      const existingId = resolveExistingId(processed);
      const businessId = existingId || insertedBusinessMap.get(processed.gbpId);
      if (!businessId) continue;

      const list = businessIdsByCity.get(processed.cityId) || [];
      list.push(businessId);
      businessIdsByCity.set(processed.cityId, list);
    }
    // Dedupe
    for (const [cityId, ids] of businessIdsByCity.entries()) {
      businessIdsByCity.set(cityId, Array.from(new Set(ids)));
    }

    // Create/update featured slots for ALL affected cities and ALL services (main + sub-services)
    for (const cityId of affectedCities) {
      let selectedPartnerIdForCity: string | null = null;

      // 1) Reuse existing city-local featured partner for the MAIN service (if present and correct)
      //    This avoids churn if the city already has a good featured partner.
      const { data: existingCityFeatured } = await supabase
        .from("featured_slots")
        .select("business_id, is_placeholder, business:businesses(city_id)")
        .eq("city_id", cityId)
        .eq("service_id", serviceId)
        .eq("status", "active")
        .not("business_id", "is", null)
        .limit(1)
        .maybeSingle();

      if (
        existingCityFeatured?.business_id &&
        (existingCityFeatured as any).business?.city_id === cityId
      ) {
        selectedPartnerIdForCity = existingCityFeatured.business_id;
        console.log(`Reusing existing city-local featured partner for city ${cityId}: ${selectedPartnerIdForCity}`);
      }

      // 2) Otherwise pick a random business from this run for THIS city
      if (!selectedPartnerIdForCity) {
        const cityBusinessIds = businessIdsByCity.get(cityId) || [];
        if (cityBusinessIds.length > 0) {
          selectedPartnerIdForCity = cityBusinessIds[Math.floor(Math.random() * cityBusinessIds.length)];
          console.log(`Selected run-local partner for city ${cityId}: ${selectedPartnerIdForCity}`);
        }
      }

      // 3) Last resort: pick any active business in the city (if available)
      if (!selectedPartnerIdForCity) {
        const { data: fallbackBusinesses } = await supabase
          .from("businesses")
          .select("id")
          .eq("city_id", cityId)
          .eq("is_active", true)
          .limit(10);

        if (fallbackBusinesses && fallbackBusinesses.length > 0) {
          selectedPartnerIdForCity = (fallbackBusinesses as Array<{ id: string }>)[
            Math.floor(Math.random() * fallbackBusinesses.length)
          ].id;
          console.log(`Selected fallback city partner for city ${cityId}: ${selectedPartnerIdForCity}`);
        }
      }

      for (const svcId of allServiceIds) {
        const { data: existingSlot } = await supabase
          .from("featured_slots")
          .select("id, business_id, status, is_placeholder, business:businesses(city_id)")
          .eq("city_id", cityId)
          .eq("service_id", svcId)
          .maybeSingle();

        if (!existingSlot) {
          await supabase.from("featured_slots").insert({
            city_id: cityId,
            service_id: svcId,
            business_id: selectedPartnerIdForCity,
            status: selectedPartnerIdForCity ? "active" : "pending",
            is_placeholder: true,
          });
          console.log(`Created featured slot for city ${cityId}, service ${svcId}`);
          continue;
        }

        // If slot exists and is a placeholder, we may fix it if it's missing a business, pending,
        // or points to a business in the wrong city.
        const existingBusinessCityId = (existingSlot as any).business?.city_id as string | undefined;
        const hasWrongCity = !!(
          existingSlot.business_id &&
          existingBusinessCityId &&
          existingBusinessCityId !== cityId
        );

        const canUpdatePlaceholder = existingSlot.is_placeholder === true;
        const needsFix = !existingSlot.business_id || existingSlot.status === "pending" || hasWrongCity;

        if (canUpdatePlaceholder && needsFix && selectedPartnerIdForCity) {
          await supabase
            .from("featured_slots")
            .update({
              business_id: selectedPartnerIdForCity,
              status: "active",
              is_placeholder: true,
            })
            .eq("id", existingSlot.id);
          console.log(`Fixed featured slot ${existingSlot.id} for city ${cityId}, service ${svcId} => ${selectedPartnerIdForCity}`);
        }
        // If slot is not a placeholder (paid/manual), or no partner is available, leave it unchanged.
      }
    }

    // Also create coverage records for sub-services
    if (subServices && subServices.length > 0) {
      console.log(`Creating coverage for ${subServices.length} sub-services...`);
      
      const subServiceCoverages: Array<{
        business_id: string;
        service_id: string;
        city_id: string;
        is_primary: boolean;
      }> = [];

      for (const processed of processedBusinesses) {
        const existingId = resolveExistingId(processed);
        const businessId = existingId || insertedBusinessMap.get(processed.gbpId);

        if (businessId) {
          for (const subService of subServices) {
            subServiceCoverages.push({
              business_id: businessId,
              service_id: subService.id,
              city_id: processed.cityId,
              is_primary: false,
            });
          }
        }
      }

      if (subServiceCoverages.length > 0) {
        // Batch upsert in chunks of 100
        for (let i = 0; i < subServiceCoverages.length; i += 100) {
          const batch = subServiceCoverages.slice(i, i + 100);
          await supabase
            .from("business_service_coverage")
            .upsert(batch, { onConflict: "business_id,service_id,city_id" });
        }
        console.log(`Upserted ${subServiceCoverages.length} sub-service coverage records`);
      }
    }

    // PHASE 8: Fetch reviews for featured partners via Outscraper Reviews API
    // This ensures recommended partners always have visible reviews
    console.log("=== PHASE 8: Fetching reviews for featured partners ===");
    
    // Collect unique featured partner IDs that were assigned in this run
    const featuredPartnerIds = new Set<string>();
    for (const cityId of affectedCities) {
      const { data: citySlots } = await supabase
        .from("featured_slots")
        .select("business_id")
        .eq("city_id", cityId)
        .in("service_id", allServiceIds)
        .eq("status", "active")
        .not("business_id", "is", null);
      
      for (const slot of citySlots || []) {
        if (slot.business_id) {
          featuredPartnerIds.add(slot.business_id);
        }
      }
    }

    console.log(`Found ${featuredPartnerIds.size} unique featured partners to fetch reviews for`);

    let partnerReviewsFetched = 0;

    if (featuredPartnerIds.size > 0) {
      // Fetch business details (gbp_id/place_id and name) for featured partners
      const { data: featuredBusinesses } = await supabase
        .from("businesses")
        .select("id, gbp_id, name")
        .in("id", Array.from(featuredPartnerIds));

      for (const business of featuredBusinesses || []) {
        // Check if business already has recent reviews (within 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: existingReviews } = await supabase
          .from("business_reviews")
          .select("id")
          .eq("business_id", business.id)
          .gte("fetched_at", thirtyDaysAgo.toISOString())
          .limit(1);

        if (existingReviews && existingReviews.length > 0) {
          console.log(`Business ${business.name} already has recent reviews, skipping`);
          continue;
        }

        // Prepare query for Outscraper Reviews API
        // Prefer place_id (gbp_id) if it looks like a valid Google place ID
        const isValidPlaceId = business.gbp_id && 
          !business.gbp_id.startsWith("synthetic_") && 
          business.gbp_id.startsWith("ChI");
        
        const searchQuery = isValidPlaceId ? business.gbp_id : `${business.name}, Sweden`;

        console.log(`Fetching reviews for featured partner: ${business.name} (query: ${searchQuery})`);

        try {
          // Call Outscraper Reviews API
          const reviewParams = new URLSearchParams({
            query: searchQuery,
            reviewsLimit: "10", // Fetch 10 to have buffer after filtering
            sort: "highest_rating",
            language: "sv",
            region: "SE",
            async: "false", // Synchronous for simplicity
          });

          const reviewsResponse = await fetch(
            `https://api.app.outscraper.com/maps/reviews-v3?${reviewParams.toString()}`,
            {
              method: "GET",
              headers: {
                "X-API-KEY": OUTSCRAPER_API_KEY,
              },
            }
          );

          if (!reviewsResponse.ok) {
            console.error(`Failed to fetch reviews for ${business.name}: ${reviewsResponse.status}`);
            continue;
          }

          const reviewsResult = await reviewsResponse.json();
          const fetchedReviews: OutscraperReview[] = [];

          // Parse reviews from response
          if (reviewsResult.data && Array.isArray(reviewsResult.data)) {
            for (const biz of reviewsResult.data) {
              if (biz.reviews_data && Array.isArray(biz.reviews_data)) {
                for (const review of biz.reviews_data) {
                  // Only include 4+ star reviews with text
                  if (review.review_rating >= 4 && review.review_text) {
                    fetchedReviews.push(review);
                  }
                }
              }
            }
          }

          if (fetchedReviews.length === 0) {
            console.log(`No 4+ star reviews found for ${business.name}`);
            continue;
          }

          // Take top 5 reviews
          const topReviews = fetchedReviews
            .sort((a, b) => (b.review_rating || 0) - (a.review_rating || 0))
            .slice(0, 5);

          // Delete old reviews for this business
          await supabase
            .from("business_reviews")
            .delete()
            .eq("business_id", business.id);

          // Insert new reviews
          const reviewInserts = topReviews.map((review) => ({
            business_id: business.id,
            author_name: review.author_title || review.autor_name || review.author_name || "Anonym",
            author_image: review.author_image || review.autor_image || null,
            rating: review.review_rating || 5,
            review_text: review.review_text || null,
            review_time: review.review_datetime_utc || review.review_timestamp || null,
            likes: review.review_likes || 0,
            fetched_at: new Date().toISOString(),
          }));

          const { error: insertError } = await supabase
            .from("business_reviews")
            .insert(reviewInserts);

          if (insertError) {
            console.error(`Error inserting reviews for ${business.name}:`, insertError);
          } else {
            partnerReviewsFetched += reviewInserts.length;
            console.log(`Saved ${reviewInserts.length} reviews for featured partner: ${business.name}`);
          }

          // Small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 500));

        } catch (err) {
          console.error(`Error fetching reviews for ${business.name}:`, err);
        }
      }
    }

    console.log(`Total reviews fetched for featured partners: ${partnerReviewsFetched}`);

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
      subServicesUpdated: subServices?.length || 0,
      reviewsSaved: totalReviewsSaved,
      featuredPartnersWithReviews: featuredPartnerIds.size,
      partnerReviewsFetched,
    };

    console.log("=== FINAL SUMMARY ===");
    console.log(JSON.stringify(summary, null, 2));
    console.log("=====================");

    // Update scrape_jobs table with completed status
    await supabase
      .from("scrape_jobs")
      .update({
        status: "completed",
        summary,
        results: results.slice(0, 200), // cap stored results
        updated_at: new Date().toISOString(),
      })
      .eq("request_id", requestId);

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

    // Try to update job status to error
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const { requestId } = await req.clone().json().catch(() => ({ requestId: null }));
        if (requestId) {
          const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
          const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
          await sb.from("scrape_jobs").update({
            status: "error",
            error_message: error instanceof Error ? error.message : "Unknown error",
            updated_at: new Date().toISOString(),
          }).eq("request_id", requestId);
        }
      }
    } catch (_) { /* best effort */ }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

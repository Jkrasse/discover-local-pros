import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequest {
  searchTerm: string;
  cities: string[];
  limit: number; // This is now the TOTAL limit per city
  serviceId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OUTSCRAPER_API_KEY = Deno.env.get("OUTSCRAPER_API_KEY");
    if (!OUTSCRAPER_API_KEY) {
      throw new Error("OUTSCRAPER_API_KEY is not configured");
    }

    const { searchTerm, cities, limit = 20, serviceId }: SearchRequest = await req.json();

    if (!searchTerm || !cities || cities.length === 0) {
      return new Response(
        JSON.stringify({ error: "searchTerm and cities are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!serviceId) {
      return new Response(
        JSON.stringify({ error: "serviceId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CRITICAL FIX: Use ONLY ONE query per city to minimize credit usage
    // The limit parameter is now the total businesses we want PER CITY
    const effectiveLimit = Math.min(Math.max(5, Number.isFinite(limit) ? limit : 20), 50);

    // Build ONE simple query per city - this is the most credit-efficient approach
    const queries = cities
      .map(city => city.trim())
      .filter(city => city.length > 0)
      .map(city => `${searchTerm} ${city}, Sweden`);

    console.log(`=== OUTSCRAPER SEARCH ===`);
    console.log(`Search term: ${searchTerm}`);
    console.log(`Cities: ${cities.length}`);
    console.log(`Limit per city: ${effectiveLimit}`);
    console.log(`Total queries: ${queries.length} (1 per city)`);
    console.log(`Estimated max results: ${queries.length * effectiveLimit}`);
    console.log(`Queries:`, queries);
    console.log(`=========================`);

    // Send request to Outscraper API
    // Using limit per query = effectiveLimit (which is the user's requested limit per city)
    const apiUrls = [
      "https://api.outscraper.cloud/maps/search-v3",
      "https://api.app.outscraper.com/maps/search-v3",
    ];
    
    const requestBody = JSON.stringify({
      query: queries,
      limit: effectiveLimit, // Now this is the actual limit per city since we have 1 query per city
      language: "sv",
      region: "SE",
      async: true,
      // Request additional data fields
      extractContacts: true, // Get emails, social media
      reviewsLimit: 5, // Get up to 5 reviews per business (for display)
      fields: [
        "name", "place_id", "full_address", "street", "city", "postal_code",
        "latitude", "longitude", "phone", "site", "rating", "reviews",
        "working_hours", "category", "subtypes", "description", "about",
        "photos", "reviews_data"
      ],
    });
    
    // Helper function for delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Retry logic with exponential backoff
    const MAX_RETRIES = 3;
    let response: Response | null = null;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      for (const url of apiUrls) {
        try {
          console.log(`Attempt ${attempt}/${MAX_RETRIES}: Trying Outscraper API at: ${url}`);
          response = await fetch(url, {
            method: "POST",
            headers: {
              "X-API-KEY": OUTSCRAPER_API_KEY,
              "Content-Type": "application/json",
            },
            body: requestBody,
          });
          if (response.ok) {
            console.log(`Successfully connected to: ${url} on attempt ${attempt}`);
            break;
          } else {
            console.log(`Non-OK response from ${url}: ${response.status}`);
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error(`Failed to connect to ${url} (attempt ${attempt}):`, errorMsg);
          lastError = err instanceof Error ? err : new Error(String(err));
          response = null;
        }
      }
      
      // If we got a successful response, break out of retry loop
      if (response?.ok) {
        break;
      }
      
      // If not the last attempt, wait before retrying (exponential backoff)
      if (attempt < MAX_RETRIES) {
        const waitTime = attempt * 2000; // 2s, 4s
        console.log(`Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
      }
    }
    
    if (!response) {
      throw lastError || new Error("Failed to connect to Outscraper API after multiple retries");
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Outscraper API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Outscraper API error: ${response.status}`, details: errorText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    console.log("Outscraper response:", result);

    // Return the request ID for polling
    return new Response(
      JSON.stringify({
        success: true,
        requestId: result.id,
        queriesCount: queries.length,
        queries: queries,
        estimatedCredits: queries.length * effectiveLimit, // More accurate estimate
        message: `Scraping started for ${queries.length} cities with limit ${effectiveLimit} per city. Use the request ID to check status.`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in outscraper-search:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

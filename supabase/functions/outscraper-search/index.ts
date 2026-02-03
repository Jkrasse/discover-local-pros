import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequest {
  searchTerm: string;
  cities: string[];
  limit: number;
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

    const { searchTerm, cities, limit = 25, serviceId }: SearchRequest = await req.json();

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

    // Max limit capped at 25 per user preference (relevance matters more than volume)
    const effectiveLimit = Math.min(Math.max(10, Number.isFinite(limit) ? limit : 25), 25);

    // Build many query variants per city to maximize recall.
    // Google Maps is sensitive to phrasing so we use several Swedish + English patterns.
    const buildCityQueries = (cityRaw: string) => {
      const city = cityRaw.trim();
      if (!city) return [] as string[];

      // Various query patterns optimized for Swedish local search
      // These mimic how users actually search for local services on Google Maps
      return [
        // Core Swedish patterns (most likely to match local listings)
        `${searchTerm} ${city}`,
        `${searchTerm} i ${city}`,
        `${searchTerm} ${city} Sverige`,
        
        // English variants (sometimes yields different results from Google)
        `${searchTerm} ${city}, Sweden`,
        `${searchTerm} in ${city} Sweden`,
        
        // Broader category patterns
        `${searchTerm} nära ${city}`,
        `Bästa ${searchTerm} ${city}`,
        
        // Direct location format (Maps sometimes prefers this)
        `${city} ${searchTerm}`,
      ];
    };

    const queries = cities.flatMap(buildCityQueries);

    console.log(`Starting Outscraper search with ${queries.length} queries (${queries.length / cities.length} variants per city). Effective limit per query: ${effectiveLimit}.`);
    console.log("Query list:", JSON.stringify(queries, null, 2));

    // Send request to Outscraper API
    // NOTE: We intentionally skip enrichment for better raw result volume.
    // Enrichment can be done in a second pass if needed.
    
    // Try multiple API endpoints (DNS issues can affect different hosts)
    const apiUrls = [
      "https://api.outscraper.cloud/maps/search-v3",
      "https://api.app.outscraper.com/maps/search-v3",
    ];
    
    const requestBody = JSON.stringify({
      query: queries,
      limit: effectiveLimit,
      language: "sv",
      region: "SE",
      async: true,
    });
    
    let response: Response | null = null;
    let lastError: Error | null = null;
    
    for (const url of apiUrls) {
      try {
        console.log(`Trying Outscraper API at: ${url}`);
        response = await fetch(url, {
          method: "POST",
          headers: {
            "X-API-KEY": OUTSCRAPER_API_KEY,
            "Content-Type": "application/json",
          },
          body: requestBody,
        });
        if (response.ok) {
          console.log(`Successfully connected to: ${url}`);
          break;
        }
      } catch (err) {
        console.error(`Failed to connect to ${url}:`, err);
        lastError = err instanceof Error ? err : new Error(String(err));
        response = null;
      }
    }
    
    if (!response) {
      throw lastError || new Error("Failed to connect to Outscraper API");
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
        message: `Scraping started for ${queries.length} queries (${cities.length} cities × ${queries.length / cities.length} variants). Use the request ID to check status.`,
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

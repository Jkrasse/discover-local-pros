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

    // We need high recall ("get everything").
    // Outscraper/Maps can be sensitive to query phrasing, so we generate a few variants per city.
    // We keep it small to control cost.
    const effectiveLimit = Math.max(10, Number.isFinite(limit) ? limit : 20);

    const buildCityQueries = (cityRaw: string) => {
      const city = cityRaw.trim();
      if (!city) return [] as string[];

      // Variants (sv + en) and without comma (often yields broader category results)
      return [
        `${searchTerm} ${city}, Sweden`,
        `${searchTerm} ${city} Sweden`,
        `${searchTerm} i ${city}`,
        `${searchTerm} in ${city} Sweden`,
      ];
    };

    const queries = cities.flatMap(buildCityQueries);

    console.log(`Starting Outscraper search with ${queries.length} queries (variants per city). Effective limit: ${effectiveLimit}. Queries:`, queries);

    // Send request to Outscraper API with enrichments
    const response = await fetch("https://api.app.outscraper.com/maps/search-v3", {
      method: "POST",
      headers: {
        "X-API-KEY": OUTSCRAPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: queries,
        limit: effectiveLimit,
        language: "sv",
        region: "SE",
        async: true,
        enrichment: [
          "domains_service",
          "company_insights_service",
          "emails_validator_service",
        ],
      }),
    });

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
        message: `Scraping started for ${queries.length} queries. Use the request ID to check status.`,
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

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

    const { searchTerm, cities, limit = 10, serviceId }: SearchRequest = await req.json();

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

    // Build queries: "Flyttfirma Stockholm, Sweden", "Flyttfirma Göteborg, Sweden", etc.
    const queries = cities.map(city => `${searchTerm} ${city.trim()}, Sweden`);

    console.log(`Starting Outscraper search with ${queries.length} queries:`, queries);

    // Send request to Outscraper API with enrichments
    const response = await fetch("https://api.app.outscraper.com/maps/search-v3", {
      method: "POST",
      headers: {
        "X-API-KEY": OUTSCRAPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: queries,
        limit: limit,
        language: "sv",
        region: "SE",
        async: true,
        enrichments: [
          "domains_service",           // Emails And Contacts
          "company_insights_service",  // Company Insights
          "emails_validator_service",  // Email Validator
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

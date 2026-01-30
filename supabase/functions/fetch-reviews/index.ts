import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReviewsRequest {
  query: string; // Business name or Google place ID
  limit?: number;
  sort?: "newest" | "most_relevant" | "highest_rating" | "lowest_rating";
}

interface Review {
  author_name: string;
  author_image?: string;
  rating: number;
  text: string;
  time: string;
  likes?: number;
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

    const { query, limit = 5, sort = "highest_rating" }: ReviewsRequest = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: "query (business name or place ID) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching reviews for: ${query}, limit: ${limit}, sort: ${sort}`);

    // Use the reviews-v2 endpoint for fetching reviews
    const params = new URLSearchParams({
      query: query,
      reviewsLimit: String(limit),
      sort: sort,
      language: "sv",
      region: "SE",
    });

    const response = await fetch(
      `https://api.app.outscraper.com/maps/reviews-v2?${params.toString()}`,
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
    console.log("Outscraper reviews response:", JSON.stringify(result).substring(0, 500));

    // Parse reviews from the response
    // Outscraper returns data in format: { data: [[{ reviews_data: [...] }]] }
    const reviews: Review[] = [];
    
    if (result.data && Array.isArray(result.data)) {
      for (const queryResult of result.data) {
        if (Array.isArray(queryResult)) {
          for (const business of queryResult) {
            if (business.reviews_data && Array.isArray(business.reviews_data)) {
              for (const review of business.reviews_data) {
                // Only include reviews with 4+ stars for "top reviews"
                if (review.review_rating >= 4) {
                  reviews.push({
                    author_name: review.autor_name || review.author_name || "Anonym",
                    author_image: review.autor_image || review.author_image,
                    rating: review.review_rating,
                    text: review.review_text || "",
                    time: review.review_datetime_utc || "",
                    likes: review.review_likes,
                  });
                }
              }
            }
          }
        }
      }
    }

    // Sort by rating (highest first) and take top N
    const topReviews = reviews
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);

    return new Response(
      JSON.stringify({
        success: true,
        reviews: topReviews,
        totalFound: reviews.length,
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

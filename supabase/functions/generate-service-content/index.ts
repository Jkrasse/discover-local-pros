import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ServiceContentRequest {
  serviceId: string;
  serviceName: string;
  cityId?: string;
  cityName?: string;
  parentServiceName?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { serviceId, serviceName, cityId, cityName, parentServiceName } = 
      await req.json() as ServiceContentRequest;

    if (!serviceId || !serviceName) {
      return new Response(
        JSON.stringify({ error: "serviceId and serviceName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentYear = new Date().getFullYear();
    const isSubService = !!parentServiceName;
    const cityContext = cityName ? ` i ${cityName}` : "";
    
    // Build the prompt for generating service-specific content
    const prompt = `Du är en svensk copywriter och SEO-expert som skapar innehåll för en katalog över lokala tjänster.

VIKTIGT: 
- All text ska vara grammatiskt korrekt på svenska
- Använd naturligt, professionellt språk
- Granska varje mening för stavfel och grammatik innan du svarar
- Undvik onödiga upprepningar

Skapa unikt, informativt innehåll för tjänsten "${serviceName}"${cityContext}.
${isSubService ? `Detta är en undertjänst till "${parentServiceName}".` : ""}

Generera följande i JSON-format:

1. "intro_text": En kort introduktionstext (2-3 meningar) som hjälper besökaren hitta rätt ${serviceName.toLowerCase()}${cityContext}. Fokusera på:
   - Vad besökaren letar efter (att hitta en pålitlig partner)
   - Hur vår katalog kan hjälpa dem jämföra och välja rätt företag
   - Nämn gärna att vi listar kvalitetsgranskade företag

2. "tips": En array med 5 konkreta tips för att välja rätt ${serviceName.toLowerCase()}${cityContext}. Varje tips ska vara en tydlig mening.

3. "checklist": En array med 6 punkter - en praktisk checklista för kunden inför ${serviceName.toLowerCase()}${cityContext}.

4. "faqs": En array med 4-5 FAQ-objekt, varje med "question" och "answer". Frågorna ska vara vanliga frågor som kunder har om ${serviceName.toLowerCase()}${cityContext}.

5. "feature_cards": En array med 3 objekt, varje med "title" (kort rubrik, 2-3 ord) och "description" (en mening) som beskriver fördelar med att anlita professionell ${serviceName.toLowerCase()}.

Granska ALL text för grammatisk korrekthet innan du svarar.
Svara ENDAST med giltig JSON utan markdown-formatering.`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate content", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const contentText = aiData.choices?.[0]?.message?.content;

    if (!contentText) {
      return new Response(
        JSON.stringify({ error: "No content generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response from AI
    let generatedContent;
    try {
      // Clean the response in case it has markdown code blocks
      const cleanedContent = contentText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      generatedContent = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", contentText);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", raw: contentText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If we have a city, save to service_content table
    if (cityId) {
      const { error: upsertError } = await supabaseClient
        .from("service_content")
        .upsert({
          service_id: serviceId,
          city_id: cityId,
          intro_text: generatedContent.intro_text,
          tips: generatedContent.tips || [],
          checklist: generatedContent.checklist || [],
          faqs: generatedContent.faqs || [],
          feature_cards: generatedContent.feature_cards || [],
          generated_at: new Date().toISOString(),
        }, {
          onConflict: "service_id,city_id",
        });

      if (upsertError) {
        console.error("Database upsert error:", upsertError);
        return new Response(
          JSON.stringify({ error: "Failed to save content", details: upsertError }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // Save as service-level template
      const { error: updateError } = await supabaseClient
        .from("services")
        .update({
          intro_template: generatedContent.intro_text,
          tips_template: generatedContent.tips || [],
          checklist_template: generatedContent.checklist || [],
          faqs_template: generatedContent.faqs || [],
          feature_cards_template: generatedContent.feature_cards || [],
        })
        .eq("id", serviceId);

      if (updateError) {
        console.error("Database update error:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update service template", details: updateError }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: generatedContent,
        savedTo: cityId ? "service_content" : "services"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
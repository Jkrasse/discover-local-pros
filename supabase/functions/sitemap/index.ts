import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const siteUrl = "https://flyttguide.se";
  const now = new Date().toISOString().split("T")[0];

  // Fetch all data in parallel
  const [citiesRes, servicesRes, businessesRes] = await Promise.all([
    supabase.from("cities").select("slug").order("name"),
    supabase.from("services").select("slug, parent_service_id"),
    supabase
      .from("businesses")
      .select("slug, city:cities(slug), business_service_coverage(service:services(slug, parent_service_id))")
      .eq("is_active", true)
      .limit(1000),
  ]);

  const cities = citiesRes.data || [];
  const services = servicesRes.data || [];
  const businesses = businessesRes.data || [];

  // Only top-level services for city pages
  const topServices = services.filter((s) => !s.parent_service_id);

  let urls = "";

  // Static pages
  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/stader", priority: "0.8", changefreq: "monthly" },
    { loc: "/om-oss", priority: "0.5", changefreq: "monthly" },
    { loc: "/hur-vi-rankar", priority: "0.5", changefreq: "monthly" },
    { loc: "/kontakt", priority: "0.5", changefreq: "monthly" },
  ];

  for (const page of staticPages) {
    urls += `  <url>
    <loc>${siteUrl}${page.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
  }

  // Service index pages
  for (const service of topServices) {
    urls += `  <url>
    <loc>${siteUrl}/${service.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  }

  // Service + city pages
  for (const service of topServices) {
    for (const city of cities) {
      urls += `  <url>
    <loc>${siteUrl}/${service.slug}/${city.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>\n`;
    }
  }

  // Business profile pages
  for (const biz of businesses) {
    const citySlug = (biz.city as any)?.slug;
    const coverage = biz.business_service_coverage as any[];
    if (!citySlug || !coverage?.length) continue;

    // Find top-level service
    const topCoverage = coverage.find((c: any) => c.service && !c.service.parent_service_id);
    const serviceSlug = topCoverage?.service?.slug || coverage[0]?.service?.slug;
    if (!serviceSlug) continue;

    urls += `  <url>
    <loc>${siteUrl}/${serviceSlug}/${citySlug}/${biz.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Content-Type": "application/xml",
  "Cache-Control": "public, max-age=3600",
};

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const baseUrl = "https://genzgifts.com";

  // Fetch active products
  const { data: products } = await supabase
    .from("products")
    .select("id, name, updated_at")
    .eq("is_active", true);

  // Static pages
  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/track-order", priority: "0.5", changefreq: "monthly" },
  ];

  const staticEntries = staticPages
    .map(
      (p) => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join("\n");

  // Generate slug from name (matching backend logic)
  const toSlug = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const productEntries = (products || [])
    .map(
      (p) => `  <url>
    <loc>${baseUrl}/gift/${toSlug(p.name)}</loc>
    <lastmod>${new Date(p.updated_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${productEntries}
</urlset>`;

  return new Response(sitemap, { headers: corsHeaders });
});

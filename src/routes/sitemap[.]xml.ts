/**
 * Dynamic sitemap for search engines: static pages, every collection
 * category, and every active product from the live catalog.
 */

import { createFileRoute } from "@tanstack/react-router";
import { categories } from "@/lib/catalog";
import { fetchAllProducts } from "@/lib/remote-catalog";
import { SITE_URL } from "@/lib/seo";

const STATIC_PATHS = [
  "/",
  "/collections",
  "/education",
  "/about",
  "/contact",
  "/terms-and-conditions",
];

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function handleSitemap(): Promise<Response> {
  const urls: string[] = [
    ...STATIC_PATHS.map((p) => `${SITE_URL}${p === "/" ? "" : p}`),
    ...categories.map((c) => `${SITE_URL}/collections/${c.slug}`),
  ];

  try {
    const products = await fetchAllProducts();
    for (const p of products) {
      urls.push(`${SITE_URL}/product/${p.id}`);
    }
  } catch (error) {
    // Serve the static + category URLs even if the catalog is unreachable.
    console.error("sitemap: product fetch failed", error);
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${xmlEscape(u)}</loc></url>`).join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: handleSitemap,
    },
  },
});

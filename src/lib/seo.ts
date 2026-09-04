/**
 * SEO helpers for trayijewellers.in
 *
 * seoHead() builds the meta + links for a route's head() so every page
 * gets a canonical URL, Open Graph and Twitter tags in one consistent
 * pattern. JSON-LD blocks live in src/components/seo-jsonld.tsx.
 */

export const SITE_URL = "https://trayijewellers.in";
export const SITE_NAME = "Trayi Jewellers";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export const STORE_INFO = {
  name: "Trayi Jewellers",
  phone: "+91 89717 83030",
  streetAddress: "2nd Floor, Bharath Mall, Near Jayalakshmi Silks, Bejai",
  city: "Mangalore",
  region: "Karnataka",
  country: "IN",
  mapUrl: "https://maps.app.goo.gl/djxGU258jm4cYURd8",
  openingHours: "Mo-Su 10:00-19:00",
} as const;

export function seoHead({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}) {
  const url = `${SITE_URL}${path === "/" ? "" : path.replace(/\/$/, "")}`;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      ...(noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_IN" },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

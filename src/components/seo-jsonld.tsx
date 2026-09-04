/**
 * SSR-rendered JSON-LD structured data blocks.
 * Google reads ld+json scripts anywhere in the document, so these are
 * rendered inline by page components.
 */

import { SITE_URL, DEFAULT_OG_IMAGE, STORE_INFO } from "@/lib/seo";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Site-wide local business markup (rendered once, in the root layout). */
export function JewelryStoreJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "JewelryStore",
        name: STORE_INFO.name,
        alternateName: "Trayi Jewellery",
        description:
          "Trayi Jewellers is Mangalore's exclusive LimeLight boutique for certified lab-grown (CVD) diamond jewellery — rings, earrings, pendants, necklaces, bracelets and bridal sets.",
        url: SITE_URL,
        telephone: STORE_INFO.phone,
        image: DEFAULT_OG_IMAGE,
        priceRange: "₹₹₹",
        address: {
          "@type": "PostalAddress",
          streetAddress: STORE_INFO.streetAddress,
          addressLocality: STORE_INFO.city,
          addressRegion: STORE_INFO.region,
          addressCountry: STORE_INFO.country,
        },
        hasMap: STORE_INFO.mapUrl,
        openingHours: STORE_INFO.openingHours,
        areaServed: ["Mangalore", "Mangaluru", "Karnataka"],
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; path: string }>;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `${SITE_URL}${item.path}`,
        })),
      }}
    />
  );
}

export function FaqJsonLd({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }}
    />
  );
}

export function ProductJsonLd({
  name,
  description,
  image,
  path,
  price,
  showPrice,
}: {
  name: string;
  description: string;
  image: string;
  path: string;
  price?: number;
  showPrice: boolean;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        image,
        url: `${SITE_URL}${path}`,
        brand: { "@type": "Brand", name: "LimeLight Lab Grown Diamonds" },
        ...(showPrice && price
          ? {
              offers: {
                "@type": "Offer",
                url: `${SITE_URL}${path}`,
                priceCurrency: "INR",
                price,
                availability: "https://schema.org/InStock",
                seller: { "@type": "Organization", name: STORE_INFO.name },
              },
            }
          : {}),
      }}
    />
  );
}

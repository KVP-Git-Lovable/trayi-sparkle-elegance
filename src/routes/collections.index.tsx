import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { categories } from "@/lib/catalog";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/collections/")({
  head: () =>
    seoHead({
      title: "Lab Grown Diamond Jewellery Collections — Trayi, Mangalore",
      description: "Explore lab grown diamond rings, earrings, pendants, necklaces, bracelets and tanmaniya in Mangalore (Mangaluru). IGI-certified CVD diamonds, perfect for gifting.",
      path: "/collections",
    }),
  component: CollectionsIndex,
});

function CollectionsIndex() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <span className="eyebrow">Collections</span>
        <h1 className="mt-4 font-display text-5xl md:text-6xl">Every occasion, considered</h1>
        <span className="hairline mt-6" />
        <p className="mt-6 max-w-xl mx-auto text-muted-foreground">
          From daily elegance to once-in-a-lifetime ceremonial pieces — each
          piece is set with certified lab-grown diamonds from LimeLight.
        </p>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-24 grid gap-3 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.slug}
            to="/collections/$category"
            params={{ category: c.slug }}
            className="group relative overflow-hidden"
          >
            <div className="overflow-hidden aspect-[3/4]">
              <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 text-background">
              <span className="text-[8px] uppercase tracking-[0.22em] opacity-80">{c.tagline}</span>
              <h2 className="mt-1 font-display text-base md:text-lg">{c.name}</h2>
            </div>
          </Link>
        ))}
      </section>
      <SiteFooter />
    </div>
  );
}

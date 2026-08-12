import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { categories } from "@/lib/catalog";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: "Collections — Trayi Jewellery" },
      { name: "description", content: "Explore Trayi's full range of LimeLight lab-grown diamond diamond and gold rings, earrings, pendants, necklaces, bracelets, tanmaniya and nose pins." },
      { property: "og:title", content: "Collections — Trayi Jewellery" },
      { property: "og:description", content: "Explore Trayi's full range of LimeLight lab-grown diamond jewellery." },
    ],
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
      <section className="mx-auto max-w-7xl px-6 pb-24 grid gap-6 md:grid-cols-2">
        {categories.map((c, i) => (
          <Link
            key={c.slug}
            to="/collections/$category"
            params={{ category: c.slug }}
            className={`group relative overflow-hidden ${i === 0 ? "md:col-span-2" : ""}`}
          >
            <div className={`overflow-hidden ${i === 0 ? "aspect-[16/8]" : "aspect-[4/5]"}`}>
              <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 text-background">
              <span className="text-[10px] uppercase tracking-[0.28em] opacity-80">{c.tagline}</span>
              <h2 className="mt-2 font-display text-3xl md:text-4xl">{c.name}</h2>
            </div>
          </Link>
        ))}
      </section>
      <SiteFooter />
    </div>
  );
}

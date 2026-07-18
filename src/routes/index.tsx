import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-main.jpg";
import bannerImg from "@/assets/collection-banner.jpg";
import educationImg from "@/assets/education-lab.jpg";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { categories, products } from "@/lib/catalog";
import { Sparkles, ShieldCheck, Leaf, Award, Instagram } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trayi Jewellery — LimeLight Lab-Grown Diamonds, Mangalore" },
      { name: "description", content: "Mangalore's exclusive LimeLight boutique. Certified lab-grown diamond rings, earrings, pendants, bracelets and bridal jewellery." },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const featured = products.slice(0, 4);
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative">
        <div className="grid md:grid-cols-2 min-h-[85vh]">
          <div className="order-2 md:order-1 flex flex-col justify-center px-6 md:px-16 py-16 bg-background">
            <span className="eyebrow">The New Collection · 2026</span>
            <h1 className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-foreground">
              Brilliance,<br />
              <em className="italic text-accent">grown with intention.</em>
            </h1>
            <p className="mt-8 max-w-md text-base text-muted-foreground leading-relaxed">
              Trayi is Mangalore's exclusive home for LimeLight lab-grown diamonds —
              chemically, optically and physically identical to mined diamonds,
              certified by IGI, and made without harm to the earth.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/collections"
                className="inline-flex items-center justify-center bg-foreground px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-background hover:bg-accent transition-colors"
              >
                Shop the Collection
              </Link>
              <Link
                to="/education"
                className="inline-flex items-center justify-center border border-foreground/30 px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-foreground hover:border-accent hover:text-accent transition-colors"
              >
                Why Lab-Grown
              </Link>
            </div>
          </div>
          <div className="order-1 md:order-2 relative overflow-hidden">
            <img src={heroImg} alt="Lab-grown diamond ring and bracelet" width={1600} height={1200} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* PROMISE STRIP */}
      <section className="border-y border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 divide-x divide-border/60">
          {[
            { icon: Award, title: "IGI Certified", note: "Every stone, independently graded" },
            { icon: ShieldCheck, title: "Lifetime Buyback", note: "Assured value, always" },
            { icon: Leaf, title: "Ethically Grown", note: "Conflict-free, low-impact" },
            { icon: Sparkles, title: "Free Cleaning", note: "Complimentary, for life" },
          ].map(({ icon: Icon, title, note }) => (
            <div key={title} className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <Icon className="h-5 w-5 text-accent" />
              <p className="text-[11px] uppercase tracking-[0.22em] text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <span className="eyebrow">Shop By Category</span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">A jewellery box, reimagined</h2>
          <span className="hairline mt-6" />
        </div>
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/collections/$category"
              params={{ category: c.slug }}
              className="group text-center"
            >
              <div className="aspect-[3/4] overflow-hidden bg-secondary/40">
                <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <h3 className="mt-4 font-display text-xl text-foreground">{c.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{c.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* EDITORIAL BANNER */}
      <section className="relative">
        <div className="relative min-h-[60vh] overflow-hidden">
          <img src={bannerImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent" />
          <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
            <div className="max-w-lg">
              <span className="eyebrow">The Bridal Edit</span>
              <h2 className="mt-6 font-display text-4xl md:text-5xl leading-tight">
                Heirlooms, made for the woman you are becoming.
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                A curated bridal collection of lab-grown diamond sets — from the
                delicate to the ceremonial — designed to be worn, treasured, and
                passed down.
              </p>
              <Link
                to="/collections/$category"
                params={{ category: "bridal" }}
                className="mt-8 inline-flex border-b border-accent pb-1 text-[11px] uppercase tracking-[0.28em] text-foreground hover:text-accent"
              >
                Discover Bridal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="eyebrow">Just Arrived</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">The season's most-loved</h2>
          </div>
          <Link
            to="/collections"
            className="text-[11px] uppercase tracking-[0.28em] border-b border-foreground pb-1 hover:text-accent hover:border-accent"
          >
            View All
          </Link>
        </div>
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* EDUCATION TEASER */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-7xl px-6 py-24 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="aspect-[4/3] overflow-hidden">
            <img src={educationImg} alt="Lab-grown diamond in tweezers" width={1400} height={1000} className="h-full w-full object-cover" />
          </div>
          <div>
            <span className="eyebrow">Know Your Diamond</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl leading-tight">
              A real diamond.<br /><em className="italic text-accent">A better story.</em>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              A lab-grown diamond is not an imitation. It is a diamond — same
              carbon crystal structure, same fire, same forever. What changes is
              the origin: grown in weeks under conditions that mirror the earth,
              without mining, without ambiguity, without compromise.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              This is not moissanite. Not cubic zirconia. Not a stone that fades
              or clouds. It is the same diamond a jeweller would grade — with a
              conscience you can wear.
            </p>
            <Link
              to="/education"
              className="mt-8 inline-flex border-b border-accent pb-1 text-[11px] uppercase tracking-[0.28em] hover:text-accent"
            >
              Read the Guide
            </Link>
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <span className="eyebrow">Follow The Journey</span>
        <h2 className="mt-4 font-display text-4xl md:text-5xl">@trayijewellers</h2>
        <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto">
          Behind the scenes, new arrivals and stories from our Mangalore
          boutique.
        </p>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-2">
          {[bannerImg, heroImg, educationImg, bannerImg].map((img, i) => (
            <a
              key={i}
              href="https://www.instagram.com/trayijewellers/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-secondary/40"
            >
              <img src={img} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition-all duration-500 group-hover:bg-foreground/40 group-hover:opacity-100">
                <Instagram className="h-6 w-6 text-background" />
              </div>
            </a>
          ))}
        </div>
        <a
          href="https://www.instagram.com/trayijewellers/"
          target="_blank" rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-2 border-b border-foreground pb-1 text-[11px] uppercase tracking-[0.28em] hover:text-accent hover:border-accent"
        >
          <Instagram className="h-4 w-4" /> Follow on Instagram
        </a>
      </section>

      <SiteFooter />
    </div>
  );
}

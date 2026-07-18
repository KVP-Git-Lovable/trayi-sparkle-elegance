import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import bannerImg from "@/assets/collection-banner.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Trayi Jewellery, Mangalore" },
      { name: "description", content: "Trayi is Mangalore's exclusive boutique for LimeLight lab-grown diamonds — a house built on integrity, craft and conscience." },
      { property: "og:title", content: "Our Story — Trayi Jewellery" },
      { property: "og:description", content: "Mangalore's exclusive LimeLight lab-grown diamond boutique." },
      { property: "og:image", content: bannerImg },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <span className="eyebrow">Our Story</span>
        <h1 className="mt-4 font-display text-5xl md:text-6xl leading-tight">
          A Mangalore boutique,<br /><em className="italic text-accent">for a modern legacy.</em>
        </h1>
        <span className="hairline mt-8" />
        <p className="mt-10 text-lg text-muted-foreground leading-relaxed">
          Trayi was founded on a simple belief — that a diamond should mean
          something. That its origin should be as beautiful as its brilliance.
          As the exclusive Mangalore destination for LimeLight — India's most
          respected lab-grown diamond house — we bring you jewellery you can
          wear, believe in, and pass on.
        </p>
      </section>

      <section className="relative">
        <div className="aspect-[16/6] overflow-hidden">
          <img src={bannerImg} alt="" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24 grid md:grid-cols-3 gap-12">
        {[
          { t: "Integrity", d: "Every stone is IGI-certified and fully traceable. No exceptions, no fine print." },
          { t: "Craft", d: "Made by artisans who set diamonds like they matter — because they do." },
          { t: "Conscience", d: "Grown without mining, without conflict, without cost to the earth." },
        ].map((v) => (
          <div key={v.t} className="text-center">
            <h3 className="font-display text-2xl text-accent">{v.t}</h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{v.d}</p>
          </div>
        ))}
      </section>

      <SiteFooter />
    </div>
  );
}

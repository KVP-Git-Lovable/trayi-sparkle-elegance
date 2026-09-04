import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { seoHead } from "@/lib/seo";
import photo1 from "@/about_photos/about-photo-1.jpeg";
import photo2 from "@/about_photos/about-photo-2.jpeg";
import photo3 from "@/about_photos/about-photo-3.jpeg";
import photo4 from "@/about_photos/about-photo-4.jpeg";
import photo5 from "@/about_photos/about-photo-5.jpeg";
import photo6 from "@/about_photos/about-photo-6.jpeg";
import photo7 from "@/about_photos/about-photo-7.jpeg";

export const Route = createFileRoute("/about")({
  head: () =>
    seoHead({
      title: "Our Story — Trayi Jewellers, Mangalore's Lab Grown Diamond Boutique",
      description: "Trayi Jewellers is Mangalore's (Mangaluru's) exclusive LimeLight boutique for the best certified lab-grown diamonds — a modern boutique at Bharath Mall, Bejai.",
      path: "/about",
    }),
  component: AboutPage,
});

function AboutPage() {
  const photos = [photo1, photo2, photo3, photo4, photo5, photo6, photo7];

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

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, idx) => (
            <div key={idx} className="overflow-hidden rounded-lg aspect-square">
              <img src={photo} alt={`Trayi boutique ${idx + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
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

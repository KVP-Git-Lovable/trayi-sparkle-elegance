import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import educationImg from "@/assets/education-lab.jpg";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/education")({
  head: () => ({
    meta: [
      { title: "Lab-Grown Diamonds: The Complete Guide — Trayi Jewellery" },
      { name: "description", content: "Understand lab-grown diamonds — how they're made, why they're real, and how they compare to moissanite, cubic zirconia and mined diamonds. Guide by Trayi, Mangalore." },
      { property: "og:title", content: "The Lab-Grown Diamond Guide — Trayi Jewellery" },
      { property: "og:description", content: "Real diamonds. Better origin. Everything you need to know about lab-grown diamonds." },
      { property: "og:image", content: educationImg },
    ],
  }),
  component: EducationPage,
});

function EducationPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative">
        <div className="aspect-[16/7] overflow-hidden">
          <img src={educationImg} alt="Lab-grown diamond examined with tweezers" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <span className="eyebrow">The Guide</span>
        <h1 className="mt-4 font-display text-5xl md:text-6xl leading-tight">
          A diamond, in every way that matters.
        </h1>
        <span className="hairline mt-8" />
        <p className="mt-8 text-lg text-muted-foreground leading-relaxed">
          A lab-grown diamond is chemically, physically and optically identical
          to a mined diamond. Same hardness (10 on the Mohs scale). Same fire.
          Same forever. What changes is only its origin — and, quietly, almost
          everything else about it.
        </p>
      </section>

      {/* HOW GROWN */}
      <section className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <span className="eyebrow">How It's Grown</span>
          <h2 className="mt-4 font-display text-4xl">From carbon to crystal, in weeks.</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            A tiny diamond seed is placed inside a chamber that recreates the
            heat and pressure of the earth's mantle. Carbon atoms bond, layer
            over layer, and grow the seed into a rough diamond — atom-identical
            to one formed underground over a billion years.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            The rough is then cut and polished by master artisans, and graded
            independently by IGI on the same 4Cs — Cut, Colour, Clarity, Carat —
            used for mined diamonds.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { k: "Hardness", v: "10 / 10 (Mohs)" },
            { k: "Refractive Index", v: "2.42" },
            { k: "Composition", v: "100% Carbon" },
            { k: "Certification", v: "IGI Graded" },
            { k: "Origin", v: "Grown in weeks" },
            { k: "Impact", v: "Conflict-free" },
          ].map((s) => (
            <div key={s.k} className="border border-border p-6">
              <p className="eyebrow text-[10px]">{s.k}</p>
              <p className="mt-2 font-display text-xl">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <span className="eyebrow">Know The Difference</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">Not all sparkle is diamond.</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Moissanite and cubic zirconia are common substitutes — inexpensive,
              bright, but they are <em>not</em> diamonds. They wear differently,
              fade differently, and are graded on a different scale.
            </p>
          </div>

          <div className="mt-14 overflow-x-auto">
            <table className="w-full min-w-[640px] border-t border-border text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 pr-4 eyebrow text-[10px]"> </th>
                  <th className="py-4 pr-4 font-display text-lg text-accent">LimeLight Lab-Grown</th>
                  <th className="py-4 pr-4 font-display text-lg">Moissanite</th>
                  <th className="py-4 pr-4 font-display text-lg">Cubic Zirconia</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ["Composition", "Pure carbon (real diamond)", "Silicon carbide", "Zirconium oxide"],
                  ["Hardness (Mohs)", "10", "9.25", "8.5"],
                  ["Brilliance over time", "Forever", "Rainbow flash, dulls with wear", "Fades, clouds, scratches"],
                  ["Certified as diamond", "Yes — IGI", "No", "No"],
                  ["Resale / heirloom value", "Yes", "Minimal", "None"],
                ].map(([k, a, b, c]) => (
                  <tr key={k} className="border-b border-border/60">
                    <td className="py-4 pr-4 font-medium">{k}</td>
                    <td className="py-4 pr-4 text-accent">{a}</td>
                    <td className="py-4 pr-4 text-muted-foreground">{b}</td>
                    <td className="py-4 pr-4 text-muted-foreground">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <span className="eyebrow">Why Women Choose Lab-Grown</span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">Same brilliance. Better conscience.</h2>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {[
            { t: "Ethical Origin", d: "No mining. No conflict. Every diamond is fully traceable to its lab of origin." },
            { t: "Bigger, Better", d: "Choose 30–40% more carat, or a higher clarity, for the same investment as a mined stone." },
            { t: "Certified Forever", d: "Independently graded by IGI on the same 4Cs, with a laser-inscribed report number." },
            { t: "Kind to the Earth", d: "A fraction of the water, land and carbon footprint of traditional mining." },
            { t: "Trayi Assured", d: "Lifetime buyback, complimentary cleaning and re-polishing at our Mangalore boutique." },
            { t: "Forever, Truly", d: "10/10 hardness. It will not scratch. It will not cloud. It will outlast us all." },
          ].map((c) => (
            <div key={c.t} className="border-l-2 border-accent pl-6">
              <h3 className="font-display text-2xl">{c.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MYTH V FACT */}
      <section className="bg-foreground text-background py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.28em] text-background/60">Myth vs. Fact</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">The truth, uncomplicated.</h2>
          </div>
          <ul className="mt-14 space-y-8">
            {[
              { m: "Lab-grown diamonds are fake.", f: "They are diamonds. Same carbon, same crystal, same certification. Only the origin differs." },
              { m: "They lose their shine.", f: "A diamond is the hardest known natural material. Its brilliance does not fade — mined or grown." },
              { m: "They're the same as moissanite.", f: "Moissanite is a different mineral entirely. Lab-grown diamonds are the real thing." },
              { m: "They have no resale value.", f: "Certified lab-grown diamonds hold real value, and Trayi offers assured lifetime buyback." },
            ].map((r) => (
              <li key={r.m} className="grid md:grid-cols-[1fr_1fr] gap-8 border-b border-background/15 pb-8">
                <div className="flex gap-3">
                  <X className="h-5 w-5 mt-1 text-background/50 shrink-0" />
                  <p className="font-display text-xl text-background/70 italic">"{r.m}"</p>
                </div>
                <div className="flex gap-3">
                  <Check className="h-5 w-5 mt-1 text-accent shrink-0" />
                  <p className="text-background/90 leading-relaxed">{r.f}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

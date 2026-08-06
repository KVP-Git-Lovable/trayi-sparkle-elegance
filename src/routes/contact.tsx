import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MapPin, Phone, Mail, Clock, Instagram } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Visit Us — Trayi Jewellery, Mangalore" },
      { name: "description", content: "Visit Trayi's LimeLight lab-grown diamond boutique in Mangalore. Book a private appointment for bridal and fine jewellery consultations." },
      { property: "og:title", content: "Visit Trayi Jewellery, Mangalore" },
      { property: "og:description", content: "Book a private appointment at our Mangalore boutique." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 py-24 grid md:grid-cols-2 gap-16">
        <div>
          <span className="eyebrow">Visit Us</span>
          <h1 className="mt-4 font-display text-5xl leading-tight">
            An unhurried appointment, in Mangalore.
          </h1>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Our boutique welcomes you for a private, guided experience —
            especially for bridal and bespoke consultations. Walk-ins are
            equally welcome.
          </p>

          <ul className="mt-10 space-y-5 text-sm">
            <li className="flex gap-3"><MapPin className="h-4 w-4 mt-1 text-accent shrink-0" /><span>2nd Floor, Bharath Mall, Near Jayalakshmi Silks, Bejai, Mangalore</span></li>
            <li className="flex gap-3"><Phone className="h-4 w-4 mt-1 text-accent shrink-0" /><span>+91 · 8971783030</span></li>
            <li className="flex gap-3"><Mail className="h-4 w-4 mt-1 text-accent shrink-0" /><span>sales.trayi@gmail.com</span></li>
            <li className="flex gap-3"><Clock className="h-4 w-4 mt-1 text-accent shrink-0" /><span>Open daily · 10:30 AM – 8:30 PM</span></li>
            <li className="flex gap-3"><Instagram className="h-4 w-4 mt-1 text-accent shrink-0" /><a href="https://www.instagram.com/trayijewellers/" target="_blank" rel="noopener noreferrer" className="hover:text-accent">@trayijewellers</a></li>
          </ul>
        </div>

        <form className="border border-border p-8 md:p-10 bg-card space-y-5">
          <div>
            <span className="eyebrow">Book an Appointment</span>
            <h2 className="mt-3 font-display text-3xl">Tell us a little</h2>
          </div>
          {[
            { l: "Full Name", t: "text", p: "Priya Rao" },
            { l: "Email", t: "email", p: "you@example.com" },
            { l: "Phone", t: "tel", p: "+91 ..." },
            { l: "Preferred Date", t: "date", p: "" },
          ].map((f) => (
            <label key={f.l} className="block">
              <span className="eyebrow text-[10px]">{f.l}</span>
              <input
                type={f.t}
                placeholder={f.p}
                className="mt-2 w-full border-b border-input bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
              />
            </label>
          ))}
          <label className="block">
            <span className="eyebrow text-[10px]">Interest</span>
            <textarea rows={3} placeholder="Bridal set, engagement ring, gifting…"
              className="mt-2 w-full border-b border-input bg-transparent py-2 text-sm focus:border-accent focus:outline-none resize-none" />
          </label>
          <button
            type="button"
            className="w-full bg-foreground py-4 text-[11px] uppercase tracking-[0.28em] text-background hover:bg-accent transition-colors"
          >
            Request Appointment
          </button>
        </form>
      </section>
      <SiteFooter />
    </div>
  );
}

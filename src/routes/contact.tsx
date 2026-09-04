import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MapPin, Phone, Mail, Clock, Instagram } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import entranceImg from "@/assets/trayi-entrance.png";
import { submitAppointmentRequest } from "@/lib/appointment-api";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    seoHead({
      title: "Visit Trayi — Diamond Store in Bejai, Mangalore (Bharath Mall)",
      description: "Visit the best diamond shop in Mangalore: Trayi Jewellers, 2nd Floor, Bharath Mall, Bejai, Mangaluru. Lab grown CVD diamond jewellery, bridal sets and diamond gifting. Call +91 89717 83030.",
      path: "/contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [interest, setInterest] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await submitAppointmentRequest({
        fullName,
        email,
        phone,
        preferredDate,
        interest,
      });
      toast.success("Appointment request submitted successfully!");
      setFullName("");
      setEmail("");
      setPhone("");
      setPreferredDate("");
      setInterest("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit appointment request";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Visit Us and Appointment Section */}
      <section className="mx-auto max-w-6xl px-6 py-24 grid md:grid-cols-2 gap-16">
        {/* Left Column: Image + Visit Us */}
        <div className="space-y-8">
          {/* Entrance Image */}
          <div className="overflow-hidden rounded-lg">
            <img
              src={entranceImg}
              alt="Trayi Boutique Entrance"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Visit Us Content */}
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
        </div>

        {/* Right Column: Appointment Form */}
        <form onSubmit={handleSubmit} className="border border-border p-8 md:p-10 bg-card space-y-5 h-fit">
          <div>
            <span className="eyebrow">Book an Appointment</span>
            <h2 className="mt-3 font-display text-3xl">Tell us a little</h2>
          </div>
          <label className="block">
            <span className="eyebrow text-[10px]">Full Name</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Priya Rao"
              className="mt-2 w-full border-b border-input bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
              required
            />
          </label>
          <label className="block">
            <span className="eyebrow text-[10px]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full border-b border-input bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
              required
            />
          </label>
          <label className="block">
            <span className="eyebrow text-[10px]">Phone</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 ..."
              className="mt-2 w-full border-b border-input bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
              required
            />
          </label>
          <label className="block">
            <span className="eyebrow text-[10px]">Preferred Date</span>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="mt-2 w-full border-b border-input bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="eyebrow text-[10px]">Interest</span>
            <textarea
              rows={3}
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="Bridal set, engagement ring, gifting…"
              className="mt-2 w-full border-b border-input bg-transparent py-2 text-sm focus:border-accent focus:outline-none resize-none"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-foreground py-4 text-[11px] uppercase tracking-[0.28em] text-background hover:bg-accent transition-colors disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Request Appointment"}
          </button>
        </form>
      </section>
      <SiteFooter />
    </div>
  );
}

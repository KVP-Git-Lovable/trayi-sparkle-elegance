import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CheckCircle2, Store, Truck } from "lucide-react";

const searchSchema = z.object({
  order: z.string().default("TRXXXXXX"),
  mode: z.enum(["delivery", "pickup"]).default("delivery"),
});

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Order Confirmed — Trayi Jewellery" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirmation,
});

function Confirmation() {
  const { order, mode } = Route.useSearch();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="flex-1 mx-auto max-w-2xl px-6 py-24 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-accent" />
        <span className="eyebrow mt-6 block">Thank you</span>
        <h1 className="mt-3 font-display text-5xl">Your order is confirmed</h1>
        <p className="mt-4 text-muted-foreground">Order Reference · <span className="text-foreground">{order}</span></p>

        <div className="mt-10 border border-border/60 p-6 text-left">
          {mode === "pickup" ? (
            <>
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-accent" />
                <p className="text-[11px] uppercase tracking-[0.22em]">Collect in Store</p>
              </div>
              <p className="mt-4 text-sm text-foreground/85">
                We're preparing your piece with care. You'll receive an SMS and email
                the moment it's ready for collection at our Mangalore boutique
                (typically within 3–5 working days).
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Please carry a government-issued photo ID and this order reference when you visit.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-accent" />
                <p className="text-[11px] uppercase tracking-[0.22em]">Home Delivery</p>
              </div>
              <p className="mt-4 text-sm text-foreground/85">
                Your piece will be dispatched via insured courier within 3 working
                days. Expected delivery in 7–10 working days. A tracking link will
                be shared as soon as your order ships.
              </p>
            </>
          )}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/collections" className="border border-foreground px-6 py-3 text-[11px] uppercase tracking-[0.28em] hover:bg-foreground hover:text-background">
            Continue Shopping
          </Link>
          <Link to="/contact" className="bg-foreground px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-background hover:bg-accent">
            Contact Concierge
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

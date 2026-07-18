import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — Trayi Jewellery" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="flex-1 mx-auto max-w-3xl px-6 py-24 text-center">
        <ShoppingBag className="mx-auto h-8 w-8 text-accent" />
        <span className="eyebrow mt-6 block">Your Bag</span>
        <h1 className="mt-3 font-display text-5xl">Empty — for now.</h1>
        <p className="mt-4 text-muted-foreground">
          Discover the collection and start your Trayi journey.
        </p>
        <Link
          to="/collections"
          className="mt-8 inline-flex bg-foreground px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-background hover:bg-accent transition-colors"
        >
          Explore Collections
        </Link>
      </section>
      <SiteFooter />
    </div>
  );
}

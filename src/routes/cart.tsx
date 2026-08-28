import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShoppingBag, Minus, Plus, X, Truck, Store } from "lucide-react";
import { useCart, itemProduct } from "@/lib/cart";
import { formatINR } from "@/lib/catalog";
import { usePriceVisibility } from "@/lib/price-visibility";

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
  const { items, setQty, remove, subtotal, hydrated } = useCart();
  const { hidePrices } = usePriceVisibility();

  if (hydrated && items.length === 0) {
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

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <span className="eyebrow">Your Bag</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Review your selections</h1>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_380px]">
          {/* Items */}
          <div className="divide-y divide-border/60 border-y border-border/60">
            {items.map((it, idx) => {
              const p = itemProduct(it);
              if (!p) return null;
              return (
                <div key={idx} className="grid grid-cols-[100px_1fr_auto] gap-4 py-6 items-start">
                  <Link to="/product/$productId" params={{ productId: p.id }} className="block">
                    <img src={p.image} alt={p.name} className="h-24 w-24 object-cover bg-secondary/40" />
                  </Link>
                  <div>
                    <Link to="/product/$productId" params={{ productId: p.id }} className="font-display text-lg hover:text-accent">
                      {p.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wide">SKU · {p.sku}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {[it.purity, it.metal, it.size && `Size ${it.size}`].filter(Boolean).join(" · ")}
                    </p>
                    <div className="mt-3 inline-flex items-center border border-border">
                      <button onClick={() => setQty(idx, it.qty - 1)} className="p-2 hover:bg-secondary" aria-label="Decrease">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs">{it.qty}</span>
                      <button onClick={() => setQty(idx, it.qty + 1)} className="p-2 hover:bg-secondary" aria-label="Increase">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    {!hidePrices && <p className="text-sm">{formatINR(p.price * it.qty)}</p>}
                    <button
                      onClick={() => remove(idx)}
                      className={`inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-accent ${hidePrices ? "" : "mt-3"}`}
                    >
                      <X className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <aside className="h-fit border border-border/60 p-6 space-y-4">
            <h2 className="eyebrow">Order Summary</h2>
            {!hidePrices && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-accent">Complimentary</span>
                </div>
                <div className="border-t border-border/60 pt-4 flex justify-between">
                  <span className="font-display text-lg">Total</span>
                  <span className="font-display text-lg">{formatINR(subtotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Inclusive of all taxes.</p>
              </>
            )}

            <div className="grid gap-2 pt-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2"><Truck className="h-4 w-4 mt-0.5 text-accent" /> Free insured delivery across India</div>
              <div className="flex items-start gap-2"><Store className="h-4 w-4 mt-0.5 text-accent" /> Or collect in-store at our Mangalore boutique</div>
            </div>

            <Link
              to="/checkout"
              className="block text-center bg-foreground px-6 py-4 text-[11px] uppercase tracking-[0.28em] text-background hover:bg-accent transition-colors"
            >
              Proceed to Checkout
            </Link>
            <Link
              to="/collections"
              className="block text-center border border-border px-6 py-3 text-[11px] uppercase tracking-[0.28em] hover:border-foreground"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

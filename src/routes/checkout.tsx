import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart, itemProduct } from "@/lib/cart";
import { formatINR } from "@/lib/catalog";
import { POS_URL, POS_ANON_KEY } from "@/lib/pos-supabase";
import { Store, Truck, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Trayi Jewellery" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

type Fulfilment = "delivery" | "pickup";
type PayMethod = "card" | "upi" | "cod_pickup";

function CheckoutPage() {
  const { items, subtotal, clear, hydrated } = useCart();
  const navigate = useNavigate();

  const [fulfilment, setFulfilment] = useState<Fulfilment>("delivery");
  const [pay, setPay] = useState<PayMethod>("card");
  const [placing, setPlacing] = useState(false);

  if (hydrated && items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <section className="flex-1 mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="font-display text-4xl">Your bag is empty</h1>
          <p className="mt-4 text-muted-foreground">Add a piece to your bag before checking out.</p>
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

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const s = (k: string) => String(fd.get(k) ?? "").trim();

    const lineItems = items
      .map((it) => {
        const p = itemProduct(it);
        if (!p) return null;
        return {
          productId: it.productId,
          name: p.name,
          sku: it.productSku ?? p.sku,
          quantity: it.qty,
          unitPrice: p.price,
          lineTotal: p.price * it.qty,
          size: it.size,
          metal: it.metal,
          purity: it.purity,
        };
      })
      .filter(Boolean);

    if (lineItems.length === 0) {
      toast.error("Your bag is empty");
      return;
    }

    setPlacing(true);
    try {
      const res = await fetch(`${POS_URL.replace(".supabase.co", ".functions.supabase.co")}/create_online_order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: POS_ANON_KEY,
          Authorization: `Bearer ${POS_ANON_KEY}`,
        },
        body: JSON.stringify({
          customerName: s("name"),
          customerEmail: s("email"),
          customerPhone: s("phone"),
          fulfillmentMethod: fulfilment,
          paymentMethod: pay,
          ...(fulfilment === "delivery"
            ? {
                shippingAddress: {
                  line1: s("address1"),
                  line2: s("address2"),
                  city: s("city"),
                  state: s("state"),
                  pincode: s("pincode"),
                },
              }
            : { preferredPickupDate: s("pickup_date") }),
          items: lineItems,
          subtotal,
          totalAmount: subtotal,
        }),
      });

      const data = await res.json().catch(() => null as any);
      if (!res.ok || !data?.orderNumber) {
        throw new Error(data?.error || "Order could not be placed");
      }

      clear();
      toast.success("Order placed successfully");
      navigate({ to: "/order-confirmation", search: { order: data.orderNumber, mode: fulfilment } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Order could not be placed. Please try again.");
    } finally {
      setPlacing(false);
    }
  };


  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <span className="eyebrow">Checkout</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">A moment to complete your order</h1>
        </div>

        <form onSubmit={submit} className="mt-12 grid gap-12 lg:grid-cols-[1fr_380px]">
          <div className="space-y-10">
            {/* Fulfilment */}
            <section>
              <h2 className="eyebrow mb-4">1 · How would you like to receive it?</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setFulfilment("delivery")}
                  className={`text-left p-5 border transition-colors ${
                    fulfilment === "delivery" ? "border-foreground bg-secondary/40" : "border-border hover:border-foreground/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-accent" />
                    <span className="text-[11px] uppercase tracking-[0.22em]">Home Delivery</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Free insured shipping · 7–10 working days</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFulfilment("pickup")}
                  className={`text-left p-5 border transition-colors ${
                    fulfilment === "pickup" ? "border-foreground bg-secondary/40" : "border-border hover:border-foreground/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Store className="h-5 w-5 text-accent" />
                    <span className="text-[11px] uppercase tracking-[0.22em]">Collect in Store</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Trayi Boutique, Mangalore · Ready in 3–5 days</p>
                </button>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="eyebrow mb-4">2 · Your details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" name="name" required />
                <Field label="Email" name="email" type="email" required />
                <Field label="Phone" name="phone" type="tel" required />
                {fulfilment === "pickup" && (
                  <Field label="Preferred Pickup Date" name="pickup_date" type="date" required />
                )}
              </div>
            </section>

            {/* Address or Store */}
            {fulfilment === "delivery" ? (
              <section>
                <h2 className="eyebrow mb-4">3 · Shipping Address</h2>
                <div className="grid gap-4">
                  <Field label="Address Line 1" name="address1" required />
                  <Field label="Address Line 2 (Optional)" name="address2" />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="City" name="city" required />
                    <Field label="State" name="state" required />
                    <Field label="PIN Code" name="pincode" required />
                  </div>
                </div>
              </section>
            ) : (
              <section>
                <h2 className="eyebrow mb-4">3 · Pickup Location</h2>
                <div className="border border-border/60 p-5 bg-secondary/30">
                  <p className="font-display text-xl">Trayi Boutique — Mangalore</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Mangalore, Karnataka · Open Mon–Sat, 10:30 AM – 8:30 PM
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    We'll notify you by SMS and email once your piece is ready.
                    Please bring a valid ID and this order confirmation when collecting.
                  </p>
                </div>
              </section>
            )}

            {/* Payment */}
            <section>
              <h2 className="eyebrow mb-4">4 · Payment</h2>
              <div className="space-y-2">
                <PayOption label="Credit / Debit Card" hint="Visa, Mastercard, Rupay, Amex" value="card" active={pay} onChange={setPay} />
                <PayOption label="UPI" hint="Google Pay, PhonePe, Paytm, BHIM" value="upi" active={pay} onChange={setPay} />
                {fulfilment === "pickup" && (
                  <PayOption label="Pay in Store on Collection" hint="Card, UPI or bank transfer at the boutique" value="cod_pickup" active={pay} onChange={setPay} />
                )}
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" /> Payments are encrypted end-to-end. This is a demo storefront — no card will be charged.
              </p>
            </section>
          </div>

          {/* Summary */}
          <aside className="h-fit border border-border/60 p-6 space-y-4">
            <h2 className="eyebrow">Order Summary</h2>
            <div className="max-h-64 overflow-auto divide-y divide-border/60">
              {items.map((it, i) => {
                const p = itemProduct(it);
                if (!p) return null;
                return (
                  <div key={i} className="flex gap-3 py-3">
                    <img src={p.image} alt={p.name} className="h-14 w-14 object-cover bg-secondary/40" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {[it.purity, it.metal, it.size && `Sz ${it.size}`].filter(Boolean).join(" · ")} · Qty {it.qty}
                      </p>
                    </div>
                    <p className="text-sm">{formatINR(p.price * it.qty)}</p>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border/60 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{fulfilment === "pickup" ? "Pickup" : "Shipping"}</span><span className="text-accent">Complimentary</span></div>
              <div className="flex justify-between font-display text-lg pt-2 border-t border-border/60">
                <span>Total</span><span>{formatINR(subtotal)}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={placing}
              className="w-full bg-foreground px-6 py-4 text-[11px] uppercase tracking-[0.28em] text-background hover:bg-accent transition-colors disabled:opacity-60"
            >
              {placing ? "Placing Order…" : "Place Order"}
            </button>
            <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-accent" /> IGI-certified · Lifetime buyback assured
            </p>
          </aside>
        </form>
      </section>
      <SiteFooter />
    </div>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full border border-border bg-background px-3 py-3 text-sm focus:outline-none focus:border-foreground"
      />
    </label>
  );
}

function PayOption({
  label, hint, value, active, onChange,
}: { label: string; hint: string; value: PayMethod; active: PayMethod; onChange: (v: PayMethod) => void }) {
  const on = active === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`w-full text-left flex items-start gap-3 p-4 border transition-colors ${
        on ? "border-foreground bg-secondary/40" : "border-border hover:border-foreground/60"
      }`}
    >
      <span className={`mt-1 h-4 w-4 rounded-full border-2 ${on ? "border-foreground bg-foreground" : "border-border"}`} />
      <span>
        <span className="block text-sm">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}

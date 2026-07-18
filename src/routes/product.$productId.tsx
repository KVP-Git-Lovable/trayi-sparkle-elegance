import { createFileRoute, notFound, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { formatINR, getProduct, products } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { ShieldCheck, Award, Truck, Store, Minus, Plus, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$productId")({
  loader: ({ params }) => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Trayi Jewellery` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: `${loaderData.product.name} — Trayi Jewellery` },
          { property: "og:description", content: loaderData.product.description },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [{ title: "Product — Trayi Jewellery" }, { name: "robots", content: "noindex" }],
  }),
  component: ProductPage,
  errorComponent: ({ error }) => (
    <div className="p-16 text-center text-sm text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-display text-4xl">Product not found</h1>
        <Link to="/collections" className="mt-6 inline-block text-accent underline-offset-4 hover:underline">
          Browse all collections
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const navigate = useNavigate();
  const { add } = useCart();

  const [activeImg, setActiveImg] = useState(product.gallery[0] ?? product.image);
  const [purity, setPurity] = useState(product.purityOptions[0]);
  const [metal, setMetal] = useState(product.metalOptions[0]);
  const [size, setSize] = useState(product.sizes?.[0]);
  const [qty, setQty] = useState(1);

  const addToBag = (goToCart = false) => {
    add({ productId: product.id, qty, size, metal, purity });
    toast.success(`${product.name} added to your bag`);
    if (goToCart) navigate({ to: "/cart" });
  };

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl px-6 pt-8 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        <Link to="/" className="hover:text-accent">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/collections" className="hover:text-accent">Collections</Link>
        <span className="mx-2">/</span>
        <Link to="/collections/$category" params={{ category: product.category }} className="hover:text-accent capitalize">
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      {/* Product */}
      <section className="mx-auto max-w-7xl px-6 py-12 grid gap-12 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden bg-secondary/40">
            <img src={activeImg} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {product.gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(g)}
                className={`aspect-square overflow-hidden bg-secondary/40 border ${
                  activeImg === g ? "border-accent" : "border-transparent"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <img src={g} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <span className="eyebrow">{product.category}</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl leading-tight">{product.name}</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">SKU · {product.sku}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-3xl">{formatINR(product.price)}</span>
            {product.mrp && (
              <span className="text-sm text-muted-foreground line-through">{formatINR(product.mrp)}</span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes · Estimated for base configuration</p>

          <p className="mt-6 text-sm text-foreground/80 leading-relaxed">{product.description}</p>

          {/* Purity */}
          <div className="mt-8">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Purity</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.purityOptions.map((p) => (
                <button
                  key={p}
                  onClick={() => setPurity(p)}
                  className={`px-4 py-2 text-xs tracking-wide border transition-colors ${
                    purity === p
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Metal */}
          <div className="mt-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Metal Colour</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.metalOptions.map((m) => (
                <button
                  key={m}
                  onClick={() => setMetal(m)}
                  className={`px-4 py-2 text-xs tracking-wide border transition-colors ${
                    metal === m
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          {product.sizes && (
            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {product.sizeLabel ?? "Size"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-12 px-4 py-2 text-xs tracking-wide border transition-colors ${
                      size === s
                        ? "bg-foreground text-background border-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Actions */}
          <div className="mt-8 flex flex-wrap items-stretch gap-3">
            <div className="inline-flex items-center border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:bg-secondary" aria-label="Decrease">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-3 hover:bg-secondary" aria-label="Increase">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => addToBag(false)}
              className="flex-1 min-w-40 border border-foreground px-6 py-4 text-[11px] uppercase tracking-[0.28em] hover:bg-foreground hover:text-background transition-colors"
            >
              Add to Bag
            </button>
            <button
              onClick={() => addToBag(true)}
              className="flex-1 min-w-40 bg-foreground px-6 py-4 text-[11px] uppercase tracking-[0.28em] text-background hover:bg-accent transition-colors"
            >
              Buy Now
            </button>
          </div>

          <div className="mt-4 flex gap-6 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <button className="inline-flex items-center gap-2 hover:text-accent"><Heart className="h-4 w-4" /> Wishlist</button>
            <button className="inline-flex items-center gap-2 hover:text-accent"><Share2 className="h-4 w-4" /> Share</button>
          </div>

          {/* Fulfilment */}
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <div className="border border-border/70 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em]">
                <Truck className="h-4 w-4 text-accent" /> Free Home Delivery
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Insured shipping across India. Delivery in 7–10 working days.
              </p>
            </div>
            <div className="border border-border/70 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em]">
                <Store className="h-4 w-4 text-accent" /> Collect in Store
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Order online, collect at our Mangalore boutique. Ready in 3–5 days.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-6 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="inline-flex items-center gap-2"><Award className="h-4 w-4 text-accent" /> IGI Certified</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> Lifetime Buyback</span>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="border-t border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-16 grid gap-10 md:grid-cols-2">
          <div>
            <span className="eyebrow">Specifications</span>
            <dl className="mt-6 divide-y divide-border/60 text-sm">
              {[
                ["Diamond", `${product.diamondCt} ct · LimeLight CVD lab-grown`],
                ["Metal", product.metal],
                ["Gross Weight", `${product.weightGm} g`],
                ["Certification", "IGI Certificate included"],
                ["SKU", product.sku],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-2 py-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <span className="eyebrow">The Trayi Promise</span>
            <ul className="mt-6 space-y-4 text-sm text-foreground/80">
              <li>· 100% real diamonds, chemically identical to mined — grown in weeks, not billions of years.</li>
              <li>· Every stone accompanied by an IGI grading certificate.</li>
              <li>· Lifetime free cleaning and polishing at our Mangalore boutique.</li>
              <li>· Assured lifetime buyback and exchange on the diamond value.</li>
              <li>· 15-day easy return on unworn pieces with original packaging.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <span className="eyebrow">You may also love</span>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">More from {product.category}</h2>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}

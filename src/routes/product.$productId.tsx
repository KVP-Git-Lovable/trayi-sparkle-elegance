import { createFileRoute, notFound, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { formatINR, type Product } from "@/lib/catalog";
import { applySchemeToPrice } from "@/lib/pos-schemes";
import { resolveColorImage } from "@/lib/metal-image";

import { fetchProductByHandle, fetchRelated } from "@/lib/remote-catalog";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useWishlist } from "@/lib/wishlist";
import { ShieldCheck, Award, Truck, Store, Minus, Plus, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$productId")({
  loader: async ({ params }) => {
    const product = await fetchProductByHandle(params.productId);
    if (!product) throw notFound();
    const related = await fetchRelated(product.category, product.id, 4);
    return { product, related };
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

function extractProductCode(imageUrl?: string): string | null {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname;
    const lastSegment = pathname.split('/').pop();

    if (!lastSegment) return null;

    // Remove query string and file extension
    let code = lastSegment.split('?')[0].split('.')[0];

    // Remove trailing UUID pattern (_<uuid>)
    code = code.replace(/_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i, '');

    // Remove trailing color tokens (_Y1, _R1, _W1, etc.)
    code = code.replace(/_[A-Z]\d+$/, '');

    return code && code.length > 0 ? code : null;
  } catch {
    return null;
  }
}

function ProductPage() {
  const { product, related } = Route.useLoaderData() as { product: Product; related: Product[] };
  const navigate = useNavigate();
  const { add } = useCart();

  const productCode = extractProductCode(product.image);

  const [purity, setPurity] = useState(product.purityOptions[0]);
  const [metal, setMetal] = useState(product.metalOptions[0]);
  const [size, setSize] = useState(product.sizes?.[0]);
  const [qty, setQty] = useState(1);

  // Normalised compare so "14 KT" / "14K" style differences never break matching.
  const norm = (v?: string) => (v ?? "").toLowerCase().replace(/[\s.]/g, "");
  const eq = (a?: string, b?: string) => !a || !b || norm(a) === norm(b);
  const variants = product.variants ?? [];
  const active =
    variants.find(
      (v) => eq(v.purity, purity) && eq(v.color, metal) && eq(v.size, size),
    ) ??
    variants.find((v) => eq(v.purity, purity) && eq(v.color, metal)) ??
    variants.find((v) => eq(v.purity, purity));
  const listPrice = active?.price ?? product.price;
  const mrp = active?.mrp ?? product.mrp;
  const sku = active?.sku ?? product.sku;

  const schemePricing = product.appliedScheme
    ? applySchemeToPrice(product.appliedScheme, listPrice)
    : null;
  const hasOffer = !!schemePricing && schemePricing.discountAmount > 0;
  const price = hasOffer ? schemePricing!.effectivePrice : listPrice;

  // Colour-aware imagery: derive the selected metal's photo, keep default until verified.
  const [colorImage, setColorImage] = useState(product.image);
  useEffect(() => {
    let cancelled = false;
    setColorImage(product.image);
    resolveColorImage(product.image, metal).then((src) => {
      if (!cancelled) setColorImage(src);
    });
    return () => {
      cancelled = true;
    };
  }, [product.image, metal]);

  const galleryImages = (product.gallery.length ? product.gallery : [product.image]).map(
    (g, i) => (i === 0 ? colorImage : g),
  );


  const addToBag = (goToCart = false) => {
    add({
      productId: product.id,
      qty,
      size,
      metal,
      purity,
      productName: product.name,
      productImage: product.image,
      productSku: sku,
      productPrice: price,
      productCode,
    });
    toast.success(`${product.name} added to your bag`);
    if (goToCart) navigate({ to: "/cart" });
  };

  const { user } = useAuth();
  const { has, toggle } = useWishlist();
  const saved = has(product.id);

  const onWishlist = async () => {
    if (!user) {
      toast.info("Sign in to save pieces to your wishlist");
      navigate({ to: "/login" });
      return;
    }
    const result = await toggle(product, price);
    if (result === "added") toast.success(`${product.name} saved to your wishlist`);
    if (result === "removed") toast.success("Removed from your wishlist");
  };

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: product.name,
      text: `${product.name} — Trayi Jewellery`,
      url,
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.error("Could not share this piece");
    }
  };



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
        <ProductGallery
          images={galleryImages}
          alt={product.name}
          fallbackSrc={product.image}
        />

        {/* Info */}
        <div>
          <span className="eyebrow">{product.category}</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl leading-tight">{product.name}</h1>
          {productCode && (
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Product Code · {productCode}</p>
          )}
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">SKU · {sku}</p>

          {hasOffer && (
            <div className="mt-6 inline-block bg-accent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              {product.offer?.schemeName ?? "Special offer"}
            </div>
          )}

          <div className={`${hasOffer ? "mt-3" : "mt-6"} flex items-baseline gap-3`}>
            <span className="font-display text-3xl">{formatINR(price)}</span>
            {hasOffer ? (
              <span className="text-sm text-muted-foreground line-through">{formatINR(listPrice)}</span>
            ) : (
              mrp && (
                <span className="text-sm text-muted-foreground line-through">{formatINR(mrp)}</span>
              )
            )}
          </div>
          {hasOffer && (
            <p className="mt-1 text-sm font-medium text-green-600">
              You save {formatINR(schemePricing!.discountAmount)}
            </p>
          )}

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
            <button
              onClick={onWishlist}
              aria-pressed={saved}
              className={`inline-flex items-center gap-2 hover:text-accent ${saved ? "text-accent" : ""}`}
            >
              <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} /> {saved ? "Saved" : "Wishlist"}
            </button>
            <button onClick={onShare} className="inline-flex items-center gap-2 hover:text-accent">
              <Share2 className="h-4 w-4" /> Share
            </button>
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
                ["SKU", sku],
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

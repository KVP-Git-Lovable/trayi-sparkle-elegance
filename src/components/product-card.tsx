import { Link } from "@tanstack/react-router";
import { formatINR, type Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  const offer = product.offer;
  const offerPrice = offer?.offerPrice;
  const hasOffer = !!offerPrice && offerPrice < product.price;

  const displayPrice = hasOffer ? offerPrice! : product.price;
  const strikePrice = hasOffer ? product.price : product.mrp;
  const savingAmount = hasOffer
    ? offer?.discountAmount ?? product.price - offerPrice!
    : product.mrp
      ? product.mrp - product.price
      : 0;
  const discountPercent = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <Link
      to="/product/$productId"
      params={{ productId: product.id }}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary/40">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />
        {hasOffer ? (
          <div className="absolute inset-x-0 top-0 z-10 bg-accent px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-foreground line-clamp-2">
            {offer?.schemeName ?? "Special offer"}
          </div>
        ) : (
          discountPercent > 0 && (
            <span className="absolute left-3 top-3 z-10 bg-accent px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-accent-foreground font-semibold">
              {discountPercent}% Off
            </span>
          )
        )}
        <span className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 bg-background/95 py-3 text-center text-[11px] uppercase tracking-[0.24em] text-foreground transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          View Details
        </span>
      </div>
      <div className="pt-4 text-center">
        <h3 className="font-display text-lg text-foreground">{product.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground tracking-wide">
          {product.carats} · {product.metal}
        </p>
        <p className="mt-2 text-sm text-foreground/90">
          {formatINR(displayPrice)}
          {strikePrice && strikePrice > displayPrice && (
            <span className="ml-2 text-xs text-muted-foreground line-through">
              {formatINR(strikePrice)}
            </span>
          )}
        </p>
        {savingAmount > 0 && (
          <p className="mt-1 text-xs text-green-600 font-medium">
            Save {formatINR(savingAmount)}
          </p>
        )}
      </div>
    </Link>
  );
}


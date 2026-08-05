import { Link } from "@tanstack/react-router";
import { formatINR, type Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
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
        {product.mrp && (
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            <span className="bg-accent px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-accent-foreground font-semibold">
              {discountPercent}% Off
            </span>
            <span className="bg-foreground px-2 py-0.5 text-[8px] uppercase tracking-[0.15em] text-background">
              Offer
            </span>
          </div>
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
          {formatINR(product.price)}
          {product.mrp && (
            <span className="ml-2 text-xs text-muted-foreground line-through">
              {formatINR(product.mrp)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}

import { formatINR, type Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary/40">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />
        <button className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 bg-background/95 py-3 text-[11px] uppercase tracking-[0.24em] text-foreground transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-foreground hover:text-background">
          Quick View
        </button>
      </div>
      <div className="pt-4 text-center">
        <h3 className="font-display text-lg text-foreground">{product.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground tracking-wide">
          {product.carats} · {product.metal}
        </p>
        <p className="mt-2 text-sm text-foreground/90">{formatINR(product.price)}</p>
      </div>
    </div>
  );
}

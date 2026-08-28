import { Link, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { formatINR, type Product } from "@/lib/catalog";
import { usePriceVisibility } from "@/lib/price-visibility";
import { useWishlist } from "@/lib/wishlist";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const { hidePrices } = usePriceVisibility();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { has, toggle } = useWishlist();
  const saved = has(product.id);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

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

  const onWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Sign in to save pieces to your wishlist");
      navigate({ to: "/login" });
      return;
    }

    setIsWishlistLoading(true);
    try {
      const result = await toggle(product, displayPrice);
      if (result === "added") toast.success(`${product.name} saved to your wishlist`);
      if (result === "removed") toast.success("Removed from your wishlist");
    } finally {
      setIsWishlistLoading(false);
    }
  };

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
        <button
          onClick={onWishlistClick}
          disabled={isWishlistLoading}
          aria-pressed={saved}
          className={`absolute right-3 top-3 z-20 p-2 hover:text-accent transition-colors ${
            isWishlistLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-5 w-5 ${saved ? "fill-accent text-accent" : "text-foreground/60"}`}
          />
        </button>
        <span className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 bg-background/95 py-3 text-center text-[11px] uppercase tracking-[0.24em] text-foreground transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          View Details
        </span>
      </div>
      <div className="pt-4 text-center">
        <h3 className="font-display text-lg text-foreground">{product.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground tracking-wide">
          {product.carats} · {product.metal}
        </p>
        {!hidePrices && (
          <>
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
          </>
        )}
      </div>
    </Link>
  );
}


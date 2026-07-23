## Problem

The POS `catalog_products.variants` array stores a distinct `price` (and `variant_id` used as SKU) for each `(size, color, purity)` combination. Our mapper in `src/lib/remote-catalog.ts` currently ignores per-variant pricing — it takes `base_price` once and picks the first variant's SKU, so the product page shows the same ₹ regardless of which Purity / Metal Colour / Size the user picks.

## Fix

Carry variant-level pricing through to the product page and recompute price + SKU whenever the user changes an option.

### 1. `src/lib/catalog.ts`
Extend `Product` with an optional `variants` field:
```ts
variants?: Array<{
  size?: string; color?: string; purity?: string;
  price: number; mrp?: number; sku: string;
}>;
```
Local (fallback) products can leave it undefined — the page falls back to `product.price` as today.

### 2. `src/lib/remote-catalog.ts`
In `mapRow`, normalize the raw `variants` JSON to that shape:
- `size` → `size`, `color` → `metal`-matching label, `purity` → `purity`
- `price` → `price`, `compare_at_price` (per variant if present, else row-level) → `mrp`
- `variant_id`/`sku` → `sku`
Attach as `product.variants`. Keep `price`/`mrp`/`sku` on the top-level Product as sensible defaults (min variant price for listing cards, first variant's SKU).

### 3. `src/routes/product.$productId.tsx`
Compute the active variant from the current `purity` + `metal` + `size` state:
```ts
const active = product.variants?.find(v =>
  (!v.purity || v.purity === purity) &&
  (!v.color  || v.color  === metal)  &&
  (!v.size   || v.size   === size)
);
const price = active?.price ?? product.price;
const mrp   = active?.mrp   ?? product.mrp;
const sku   = active?.sku   ?? product.sku;
```
Render `price`, `mrp`, `sku` (instead of `product.price` etc.) in the price block, SKU line, and the "Add to bag" action. No visual/design changes.

### 4. Collection cards
`ProductCard` keeps using `product.price` — set that to the minimum variant price in `mapRow` so listing pages show the "from" price consistently with what the detail page shows for the default selection.

## Out of scope
- No schema, cart, or checkout changes. Cart already stores selected `size/metal/purity`; totals can be revisited in a follow-up if you want per-variant pricing to flow through the cart subtotal.
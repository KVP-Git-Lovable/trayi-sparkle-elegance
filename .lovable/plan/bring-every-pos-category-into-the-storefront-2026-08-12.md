# Bring every POS category into the storefront

The POS catalog holds 750 active products across 12 categories, but the storefront only maps 5 of them. Everything else — 63 Gold Earrings, 41 Tanmaniya, 37 Gold Rings, 30 Gold Pendants, 29 Gold Necklaces, 7 Gold Bracelets, 1 Nose Pin — has no collection to live in, so those products never appear.

Live counts from the POS catalog:

```text
EARRING 221   PENDANT 98   RING 96   NECKLACE 80
GOLD EARRING 63   Bracelet 47   Tanmaniya 41   GOLD RING 37
GOLD PENDANT 30   GOLD NECKLACE 29   GOLD Bracelet 7   NOSE PIN 1
```

## What changes for shoppers

The /collections page will show 12 tiles instead of 6:

- Existing diamond lines: Rings, Earrings, Pendants, Necklaces, Bracelets
- New gold lines: Gold Rings, Gold Earrings, Gold Pendants, Gold Necklaces, Gold Bracelets
- New: Tanmaniya, Nose Pins
- Bridal is removed (no POS products map to it)

Each new tile opens a full category page with the same luxury layout, filters, price slider, product cards, offer ribbons and product detail pages that the existing collections already have. Purity, karat, metal colour and per-variant pricing come through exactly as they do today, since every category uses the same mapper.

Gold lines are kept as their own collections so they mirror the POS structure one-to-one.

## Technical changes

1. `src/lib/catalog.ts`
   - Replace the `categories` array: drop `bridal`, add `gold-rings`, `gold-earrings`, `gold-pendants`, `gold-necklaces`, `gold-bracelets`, `tanmaniya`, `nose-pins`, each with a name, tagline and cover image.
   - Remove the now-dead `bridal` entries from the local demo `products` array only where they'd break the type; live data is unaffected.
2. `src/lib/remote-catalog.ts`
   - Extend `TYPE_TO_SLUG` with every POS `product_type` value (case-insensitive keys already lowercased): `gold earring` → `gold-earrings`, `gold ring` → `gold-rings`, `gold pendant` → `gold-pendants`, `gold necklace` → `gold-necklaces`, `gold bracelet` → `gold-bracelets`, `tanmaniya` → `tanmaniya`, `nose pin` → `nose-pins`. Keep existing mappings.
   - Extend `SLUG_TO_TYPES` and `SIZE_LABEL` to match (Ring Size for gold rings, Length for gold bracelets, Chain Length for gold necklaces/pendants/tanmaniya, Size for gold earrings/nose pins).
   - Add a guard so any future POS category with no mapping falls back to a generic slug instead of vanishing, and log it once — this is what makes new POS categories visible rather than silently dropped.
3. Cover images: generate 7 new on-brand category images in the Trayi ivory/charcoal palette (gold rings, gold earrings, gold pendants, gold necklaces, gold bracelets, tanmaniya, nose pin) into `src/assets` and import them in `catalog.ts`.
4. `src/routes/collections.index.tsx`: no logic change; the grid already maps over `categories`, so the new tiles appear automatically. The first tile keeps its full-width treatment.
5. Any hardcoded `bridal` link or reference (site header/footer nav, home page category strip) is repointed or removed so no route 404s.

Filters, scheme/offer pricing, variant pricing, cart, checkout and wishlist logic are untouched — new categories flow through the same code path as the existing ones.

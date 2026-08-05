# Show POS scheme offers and offer prices on the storefront

Offers configured in Scheme Config Master already drive the discounted prices shown in Catalog Master. The storefront currently does not read them: it queries a `promotions` table that does not exist in the POS backend, so the offer lookup silently fails and every product shows its plain price.

The real source is the POS `schemes` table, which is already publicly readable with the same anon key the storefront uses for the catalog. Confirmed live examples: "25% off on Rings" (category RING, 25%, capped at Rs 5,000) and "Rs 2,000 off on Earrings" (EARRING, price band Rs 15,000-75,000).

## What will change for shoppers

- Products covered by an active scheme show the same discounted price as the POS catalog, with the original price struck through.
- An offer ribbon with the scheme name appears on the product card, styled in the Trayi luxury palette (accent gold, not the POS red/orange), plus a "Save Rs X" line.
- The product detail page shows the same offer name, offer price, original price, and savings.
- No offer configured, or the scheme has expired, means the product looks exactly as it does today.

## How offers are matched (mirrors POS exactly)

Port the POS scheme evaluation logic so both apps agree on price:

- Scheme is honoured only when `status = 'active'` and today falls between `start_date` and `end_date`.
- Rule types supported: `product` (specific product ids), `category`, `category_price` (category plus base-price band), `category_dia`, `category_making`, and `generic` (all products).
- When several schemes match, the winner is the highest `priority`, tie-broken by specificity: product > category+attribute > category > generic.
- Discount types: percentage, fixed, tiered, cashback, bundle, buy-x-get-y, second-at-discount, capped by `max_discount_amount`.
- Discount applies to the price basis (`discount_basis`); the displayed price drops only when the basis is `product_price`, same as POS.

## Technical changes

1. `src/lib/pos-schemes.ts` (new): typed `Scheme` shape plus a port of the POS `schemeEvaluationEngine` (`evaluateApplicableSchemes` / `calculateEffectivePrice`), unchanged in behaviour.
2. `src/lib/remote-catalog.ts`:
   - Replace `fetchOffers()` (dead `promotions` query) with `fetchActiveSchemes()` reading `schemes` from `posSupabase` filtered to `status = 'active'`.
   - After mapping each row, evaluate schemes against `{ productId: row.id, productName: title, category: row.product_type, basePrice: row.base_price }` — base price, matching what the POS card uses.
   - Populate the existing `product.offer` field with scheme name, discount amount/percent, and set an `offerPrice`; keep `price`/`mrp` semantics intact so cart and checkout logic are untouched.
   - Apply the same in `fetchProductByHandle` and, via it, related products.
3. `src/lib/catalog.ts`: extend the `Offer` type on `Product` with `offerPrice` and `schemeName`.
4. `src/components/product-card.tsx`: render offer price + struck-through original + savings when an offer exists; use the existing accent ribbon slot rather than adding new hardcoded colours.
5. `src/routes/product.$productId.tsx`: show the offer badge and offer price in the price block; when a variant is selected, apply the same scheme discount to that variant's price so detail and listing stay consistent.

Filters, sorting, cart, checkout, and wishlist behaviour are unchanged; the price-range filter continues to use the catalog price.

## Open point

Cart and checkout will continue to charge the pre-offer price unless you want the discount carried through the purchase flow too. This plan covers display only; say the word and I will extend it to cart totals.

# Colour-aware product images

## What you'll see
On a product page, picking Rose Gold / White Gold / Yellow Gold swaps the main image (and thumbnails) to that metal's photo instead of always showing the default one. If a colour photo genuinely doesn't exist for that piece, the page quietly keeps the default image — never a broken image box.

## Is the "swap the letter" approach correct?
Partly. It is the only option available today, because the catalog stores a single `image_url` per product and no per-colour image list. Two real limits confirmed from the live catalog data:

- Codes are not always a clean single letter. Examples in the data: `DLR000257_R1.jpg` (clean) and `DER000411_W1_62ca219c-...jpg` (code plus a Shopify uniqueness hash). Swapping `W1` to `R1` in the second case produces a URL that does not exist, because the hash belongs to the white-gold file only.
- Variants such as `YY1`, `Y2`, `RG1` can exist, so a hard-coded one-letter map will miss cases.

So the swap must be treated as a *guess with verification*, not a certainty. That is what this plan builds.

## Approach
1. **Parse the colour code** from the image filename with a pattern that matches a code segment right after the style number: `_(W|Y|R|YY|WW|RR|WG|YG|RG)(\d?)` before the extension or before a trailing hash segment. Keep the original number/suffix so `Y2` maps to `R2`, not `R1`.
2. **Generate ordered candidate URLs** for the requested colour (e.g. for Rose Gold: `R1`, `RG1`, `RR1`, plus the same forms without the digit), preserving everything else in the URL, including the query string.
3. **Verify in the browser before showing.** A small helper preloads each candidate with an `Image` object and resolves on the first one that loads; if all fail, it resolves to the original `image_url`. Results are cached per product+colour so a colour is probed only once per session.
4. **Hash-suffixed filenames**: the candidate list also includes the variant with the trailing hash removed (`DER000411_R1.jpg`), which is how Shopify usually names the plain file. If neither loads, fallback applies.
5. **Wire into the UI**: the product page passes the selected metal colour into the gallery; the gallery shows the resolved image and falls back on `onError`. Collection cards are unchanged.

## Technical notes
- New helper `src/lib/metal-image.ts`: `colorCodeCandidates(url, colorName)` (pure, testable) and `resolveColorImage(url, colorName)` (browser-side probe + in-memory cache).
- `src/components/product-gallery.tsx`: accept an optional resolved image override for slot 0; keep zoom, thumbnails, lightbox behaviour as-is.
- `src/routes/product.$productId.tsx`: on `metal` change, resolve the image and pass it to the gallery; the default image renders immediately while resolution is in flight, so there is no flicker to empty.
- No database or catalog-mapping changes; nothing else in the app is touched.

## Long-term recommendation
The durable fix is on the POS side: store a `color_images` map (colour → URL) on `catalog_products` at Shopify import time, when all image URLs for a product are known. Then the storefront reads it directly and no filename guessing is needed. This plan works without it and keeps working if that field is added later.

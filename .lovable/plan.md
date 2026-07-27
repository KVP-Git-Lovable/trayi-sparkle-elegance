## Goal

Add a luxury-styled filter sidebar to every category page (`/collections/rings`, `/earrings`, `/pendants`, `/necklaces`, `/bracelets`, `/bridal`) matching the reference: Price range, Carat, Purity, Colour, Size, and Shop For (Her / Him). Nothing in cart, checkout, product pages, or data fetching changes.

## Layout

Category pages become a two-column grid below the hero: sticky sidebar (approx. 260px) on the left, product grid on the right (3-up desktop, 2-up tablet). On mobile the sidebar collapses into a "Filters" button that opens a slide-in sheet, so the current mobile grid stays clean.

Sidebar sections are collapsible accordions with the existing serif headings, hairline dividers and uppercase eyebrow styling — same palette and typography as today, no new colours.

## Filters

- **Price** — dual number inputs plus a range slider, min 0 to the highest price in that category (computed from loaded products, exactly like the reference "The highest price is ₹569,589").
- **Carat** — buckets (below 1 carat, 1–2, 2–3, 3 & above) derived from product tags.
- **Purity** — 9 KT / 14 KT / 18 KT, from each product's purity options.
- **Colour** — Yellow / White / Rose Gold, from metal options.
- **Size** — the category's size values (ring size, length, chain length), shown only where sizes exist.
- **Shop For** — Her / Him, derived from tags (e.g. "Ladies rings", "Mens"). This section only renders when the catalog actually has gendered tags for that category, so it never shows an empty or misleading facet.

Every option list is built from the products actually returned for that category, so no dead checkboxes appear. Each option shows a live match count, and a "Clear all" resets everything. A product matches price when any of its variants falls in range, so multi-price items behave correctly.

## State in the URL

Filters live in the URL as search params (`min`, `max`, `purity`, `color`, `size`, `carat`, `for`) via TanStack Router `validateSearch`, so filtered views are shareable and survive back/forward. Filtering happens client-side over the already-loaded category rows — the existing Supabase loader query is untouched.

## Empty state

When filters exclude everything, the grid shows a "No pieces match these filters" message with a Clear all action, instead of the current "New pieces arriving soon" copy (which stays for genuinely empty categories).

## Technical notes

- New `src/components/collection-filters.tsx` (sidebar UI) and `src/lib/product-filters.ts` (facet extraction + matching logic).
- `src/lib/remote-catalog.ts` gains pass-through of `tags` onto the mapped `Product` (additive field only) so carat and gender facets have a source.
- `src/routes/collections.$category.tsx` gets `validateSearch` plus the two-column layout; loader, head metadata, hero and `ProductCard` stay as-is.
- Uses the existing shadcn `slider`, `checkbox`, `accordion` and `sheet` primitives.

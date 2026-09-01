# Match the header "TRAYI" wordmark to the reference font

Yes — this is doable. The attached reference is a high-contrast display serif with fine hairline serifs and wide letter spacing. The header currently renders TRAYI in Cormorant Garamond, which is lighter and narrower than the reference.

## What changes

Only the TRAYI text in the site header:

- Load **Playfair Display** (closest free match to the reference letterforms: heavier vertical stems, crisp thin serifs, the same flared `R` leg and pointed `A`) alongside the existing fonts.
- Add a `--font-wordmark` token in `src/styles.css` and apply it to the TRAYI text in `src/components/site-header.tsx`, with letter spacing and weight tuned to match the reference spacing.

## What stays exactly as-is

- The diamond logo image, its size, and its transparency/blend behaviour — untouched.
- Header layout, nav, cart/account icons, footer logo.
- Cormorant Garamond remains the display font everywhere else on the site.

## Technical notes

- Add the Playfair Display family to the existing Google Fonts `<link>` in `src/routes/__root.tsx` (no CSS `@import`).
- Add `--font-wordmark: "Playfair Display", serif;` in the `@theme inline` block of `src/styles.css`.
- Swap `font-display` for `font-wordmark` on the TRAYI `<span>` only in `src/components/site-header.tsx`.

If you'd rather match a different candidate (Cormorant SemiBold, Prata, or Bodoni Moda), say which and I'll use that instead.

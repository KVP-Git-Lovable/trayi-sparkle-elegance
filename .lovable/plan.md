# Fix garbled text in product descriptions

## What I found

I pulled all 750 catalog rows from the POS catalog and scanned the `description` field.

- **245 products** contain garbled sequences (`Ãƒâ€šÃ‚Â`, `ÃƒÆ’Ã†â€™`, `Ã¢â‚¬Å¡`, `Ã‚Â`, etc.).
- Breakdown by category: **Earrings — 216**, **Tanmaniya — 28**, **Rings — 1** (Classic Legacy Diamond Ring).
- The remaining ~505 products are clean.

Examples of affected pages:
`/product/classic-legacy-diamond-ring`, `/product/sleek-heart-cut-halo-diamond-earrings`, `/product/sun-rays-diamond-earrings`, `/product/majestic-mirage-diamond-earrings`, `/product/regal-resplendence-elegance-earrings`, `/product/der000411` (Power Emerald Halo Stud Earrings) — plus 239 more in the same two categories.

## Why it happens

The source text was UTF-8 encoded, then re-interpreted as Windows-1252 — in some rows two or three times over. A single non-breaking space (`\u00a0`) becomes `Â`, then `Ã‚Â`, then `Ãƒâ€šÃ‚Â`. Nothing is broken in this project's code; the stored text itself carries the damage, and the storefront simply prints it.

## The fix (display-side only)

Add a small text sanitiser and apply it where the description is already processed — the `stripHtml(row.description)` call in `src/lib/remote-catalog.ts` (line 203). Nothing else changes: no pricing, filtering, cart, or POS data is touched, and the POS database is not modified.

The sanitiser will:
1. Find each run of non-ASCII characters and repeatedly re-decode it (Windows-1252 bytes → UTF-8) until it stops changing — this unwinds single, double, and triple encoding in one pass.
2. Clean up leftover artefacts that sit next to plain spaces (a trailing `Â` / `Ã‚Â` from a mangled non-breaking space) and convert real non-breaking spaces to normal spaces.
3. Collapse the resulting double spaces and trim.
4. Leave genuine punctuation intact — curly quotes, apostrophes, en/em dashes and accented characters are restored to their correct form, not stripped.

Verified against all 750 rows: after this transformation, zero descriptions contain garbled sequences, and the sample text reads correctly ("…perfectly designed for you.").

## Where it applies

Because the descriptions all flow through the one mapper in `src/lib/remote-catalog.ts`, the same fix automatically covers:
- product detail pages (`/product/$productId`) and their meta/OG descriptions,
- collection grids and cards that show description snippets,
- search results.

## Technical notes

- New helper: `src/lib/text-clean.ts` exporting `cleanText(input: string): string`.
- Single call site: the description mapping in `src/lib/remote-catalog.ts`; optionally also the product `title` mapping for safety (titles currently scan clean).
- No migrations, no schema changes, no changes to the POS project.

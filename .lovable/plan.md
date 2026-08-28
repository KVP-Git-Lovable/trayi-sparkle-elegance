# Fix: hidden Price and Colour filters still showing

## What's happening

The configurator stores these settings in the shared config table:

- `price_display` = `"hide"` (text)
- `price_filter_visible` = `false` (a real boolean, not the text `"false"`)
- `colour_filter_visible` = `false` (a real boolean)

The storefront reads the two filter flags and compares them against the *text* `"false"`. A boolean `false` never equals the string `"false"`, so the code falls back to its default of "show" — which is why both filters keep appearing even after you hide them.

The price toggle works because that one really is stored as text.

## The fix

In the filter-visibility reader (`src/lib/filter-visibility.tsx`), interpret the stored value tolerantly instead of comparing to one exact string:

- Treat boolean `false`, the strings `"false"`, `"hide"`, `"0"`, `"no"`, and `null`-as-explicitly-off consistently as hidden.
- Treat boolean `true`, `"true"`, `"show"`, `"1"`, `"yes"` as visible.
- Keep the current default: if the row is missing entirely, show the filter.

No other behaviour changes — the price-display toggle, product data, filtering logic, and the configurator project stay untouched.

## Technical notes

- The Supabase column is JSONB, so values arrive as native JSON (`false`), not strings. A small `parseFlag(value)` helper handles both shapes.
- Only `src/lib/filter-visibility.tsx` changes; `collection-filters.tsx` already gates the Price and Colour sections on these flags.

## Goal

Keep `/collections` (the index grid of category tiles) looking exactly as it does today, but have the category pages (`/collections/rings`, `/earrings`, `/pendants`, `/bracelets`, `/bridal`) and the product detail pages (`/product/$productId`) pull live rows from the Trayi Jewellers Project's `catalog_products` table (same source as `/pos/catalog`). All existing visual styling — typography, ivory palette, hero banners, ProductCard, gallery, cart, checkout — is preserved.

## What changes

1. **Add a second Supabase client** for the Trayi Jewellers (POS) project. This project already uses its own Lovable Cloud Supabase for auth/cart; the POS catalog lives in a different Supabase project, so we add a separate read-only client that only queries `catalog_products`.
   - New file `src/lib/pos-supabase.ts` — `createClient(url, anonKey, { auth: { persistSession: false } })`.
   - Env vars added via secure form: `VITE_POS_SUPABASE_URL` = `https://pdtasnfsdnfttayxibqy.supabase.co` and `VITE_POS_SUPABASE_ANON_KEY` (I'll ask you to paste the anon key in the secure form — it's a publishable JWT, safe in client code).

2. **New remote catalog module** `src/lib/remote-catalog.ts` that maps `catalog_products` rows to the existing `Product` shape used by `ProductCard`, cart, and PDP — so nothing downstream changes:
   - `id ← handle ?? id`, `name ← title`, `sku ← first variant id`, `price ← base_price`, `mrp ← compare_at_price`, `image/gallery ← image_url`, `description ← description` (HTML stripped for card blurb), `metalOptions ← options.Color`, `purityOptions ← options.Purity` (default `["14 KT","18 KT"]`), `sizes ← options.Size`, `category ← slug from product_type`.
   - Category slug map: `Rings → rings`, `Earrings → earrings`, `Pendants|Necklaces → pendants`, `Bracelets → bracelets`, `Bridal → bridal`.
   - Exposes `fetchProductsByCategory(slug)`, `fetchProductByHandle(handle)`, `fetchRelated(category, excludeId)`.
   - Filters `status = 'active'` (RLS also enforces this).

3. **Rewire only these routes** (JSX, layout, and styling unchanged):
   - `src/routes/collections.$category.tsx` — loader calls `fetchProductsByCategory(params.category)` and renders the same hero + `ProductCard` grid; empty-state copy stays.
   - `src/routes/product.$productId.tsx` — loader calls `fetchProductByHandle(params.productId)`; PDP gallery/spec/related section render as today; related uses `fetchRelated`.
   - Both routes use TanStack Query (`ensureQueryData` + `useSuspenseQuery`) with proper `errorComponent` / `notFoundComponent` (already present).
   - Category heroes/banners keep using the existing local images (looked up from the current `categories` array by slug).

4. **Untouched:**
   - `/collections` index page (the category tile grid) — still driven by local `categories`.
   - `src/lib/catalog.ts` — kept as-is so cart, checkout, order-confirmation, education, about, header/footer keep compiling. The two rewired routes stop importing product data from it but still use `formatINR` and the `Product` type.
   - Cart / checkout / login / order-confirmation — unchanged; `useCart` continues to work because mapped `Product` shape matches.
   - Design system, fonts, spacing, ProductCard, ProductGallery — no visual edits.

## Technical notes

- Anon key is publishable and safe in the client bundle; RLS + the `status='active'` policy (already deployed on the POS project) gate access.
- Cart persists items by `productId` in localStorage — since we now use `handle` as the id, previously-saved cart items from the old hardcoded catalog may not resolve. Acceptable for a design-preview cart; noted for you.
- No edge functions, no migrations in this project.

## Out of scope

- No change to `/pos/catalog` or the POS project.
- No redesign of any Lumina page.
- No admin surface here — this project stays read-only against the catalog.

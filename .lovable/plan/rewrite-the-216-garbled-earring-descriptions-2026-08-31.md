# Rewrite the 216 garbled earring descriptions

## Confirmed current state

I re-checked the live catalog (750 products): **245 descriptions still contain garbled characters** — 216 EARRING, 28 Tanmaniya, 1 RING. This task is scoped to the **216 earrings only**; Tanmaniya and the single ring stay untouched.

I also confirmed the storefront's key is allowed to write to the catalog table, so the fix can be applied at the source rather than patched at display time.

## Approach

Instead of five rotating templates (which would repeat the same wording 43 times), each earring gets a genuinely unique description written from its own data: product title and style cues (stud, halo, hoop, drop, solitaire, emerald/pear/oval cut, etc.), category, metal colours available, purity options, and diamond clarity/colour where present.

Descriptions are produced by the built-in AI (Lovable AI Gateway) in small batches, given each product's real attributes, with a strict brief: 3-4 sentences, ~60-90 words, luxury Trayi/LimeLight voice, mention lab-grown diamonds, no invented prices, no repeated openings. A deterministic attribute-based writer is used as a fallback for any item the AI returns badly, so all 216 always end with clean copy.

## Steps

1. **Backup** — export all current earring rows to a timestamped JSON file in the project before anything changes.
2. **Identify** — select exactly the earrings whose description contains garbled sequences (currently 216); clean earrings are never touched.
3. **Generate** — produce one unique description per affected product from its own attributes.
4. **Validate** — every description must be 3-4 sentences, 150-450 characters, free of garbled characters, and distinct from every other one (duplicate check across the whole set). Failures are regenerated.
5. **Dry run** — write a preview report and log listing old vs new text for all 216, and print the first 5 for review. Nothing is written to the database in this step.
6. **Live update** — after you approve the preview, update only those 216 rows' `description` field.
7. **Verify** — re-read the updated rows and confirm zero garbled characters remain, then spot-check `/collections/earrings` and a few product pages in the browser.

## What does not change

- No pricing, variants, images, titles, handles, stock, or category data.
- No changes to Tanmaniya or the ring (their garbled text stays covered by the existing display-time cleaner).
- The existing display-side sanitiser stays in place as a safety net.
- No storefront UI, filter, cart, checkout, or POS behaviour changes.

## Technical notes

- Script: `scripts/fix-earrings-garbled-text.js`, rewritten to use per-product AI generation plus the deterministic fallback, run with `--dry-run` first, then live.
- Reads/writes `catalog_products` in the POS backend through its REST endpoint using the existing publishable key already stored in `src/lib/pos-supabase.ts`.
- Artefacts written to `data-backups/`: `earrings_backup_<date>.json`, `fix-earrings-<date>.log`, `fix-report-<date>.json`.
- Updates run row-by-row with per-row error capture; a failed row is reported, never silently skipped.  
  
Validation:  
4 things I would change
  **1. Don't rely on "duplicate description" as the only uniqueness test.**
  Two descriptions can be technically different but still almost identical. Add a similarity check, not just exact duplicate detection.
  For example:
  - exact duplicate → reject
  - extremely similar opening/structure → regenerate
  - same first sentence across many products → reject
  The requirement should be **meaningfully differentiated copy**, not merely different strings.
  ---
  **2. The 150–450 character limit conflicts somewhat with 60–90 words.**
  60–90 English words can easily exceed 450 characters.
  I'd use something like:
  > **3–4 sentences, approximately 50–80 words, maximum ~600 characters**
  Or, if 150–450 characters is important for the UI/SEO, remove the 60–90-word requirement.
  I'd prioritize **natural, useful descriptions over hitting an arbitrary character count**.
  ---
  **3. Be very careful with "mention lab-grown diamonds."**
  This is the biggest content concern.
  The plan says every description should mention lab-grown diamonds. That's fine **only if every affected earring is actually a lab-grown diamond product**.
  If the catalog's product data confirms that, great.
  If not, don't force the claim.
  The generator should have a hard rule:
  > **Never claim a material, diamond type, metal, purity, clarity, colour, stone, certification, or feature unless that attribute is explicitly present in the source product data.**
  This is more important than making all descriptions stylistically consistent.
  ---
  **4. Don't store the backup only inside the project and then commit it.**
  A backup in `data-backups/` is good, but make sure it isn't accidentally committed to the repository if it contains proprietary catalog data.
  I'd add:
  > Add `data-backups/` to `.gitignore` unless the project explicitly requires these snapshots to be version-controlled.
  Also, ideally the backup should contain the **exact row ID + original description + relevant fields**, so rollback is straightforward.
  ---
  # One thing I especially like
  This part is excellent:
  > "a failed row is reported, never silently skipped."
  I'd strengthen it further:
  **The script should refuse to declare success unless all 216 rows have been successfully updated and verified.**
  For example:
  ```

  ```
  ```
  Expected: 216
  Generated: 216
  Validated: 216
  Updated: 216
  Verified: 216
  Failed: 0
  ```
  If it ends up:
  ```

  ```
  ```
  Updated: 214
  Failed: 2
  ```
  the process should clearly report **PARTIAL FAILURE**, not "completed successfully."
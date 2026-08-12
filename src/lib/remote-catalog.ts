import { posSupabase } from "./pos-supabase";
import type { Product } from "./catalog";
import { evaluateApplicableSchemes, type Scheme } from "./pos-schemes";

type CatalogRow = {
  id: string;
  handle: string | null;
  title: string;
  vendor: string | null;
  product_type: string | null;
  image_url: string | null;
  description: string | null;
  display_price: string | null;
  base_price: number | null;
  compare_at_price: number | null;
  options: Record<string, string[]> | null;
  variants: Array<Record<string, unknown>> | null;
  tags: string[] | null;
};


const SELECT =
  "id,handle,title,vendor,product_type,image_url,description,display_price,base_price,compare_at_price,options,variants,tags";

// product_type (from POS catalog) → storefront category slug
const TYPE_TO_SLUG: Record<string, string> = {
  rings: "rings",
  ring: "rings",
  earrings: "earrings",
  earring: "earrings",
  pendants: "pendants",
  pendant: "pendants",
  necklaces: "necklaces",
  necklace: "necklaces",
  bracelets: "bracelets",
  bracelet: "bracelets",
  "mangalsutra bracelets": "bracelets",
  tanmaniya: "tanmaniya",
  "nose pin": "nose-pins",
  "nose pins": "nose-pins",
  "gold ring": "gold-rings",
  "gold rings": "gold-rings",
  "gold earring": "gold-earrings",
  "gold earrings": "gold-earrings",
  "gold pendant": "gold-pendants",
  "gold pendants": "gold-pendants",
  "gold necklace": "gold-necklaces",
  "gold necklaces": "gold-necklaces",
  "gold bracelet": "gold-bracelets",
  "gold bracelets": "gold-bracelets",
};

/** Slug for a POS product_type; unmapped types fall back to a kebab slug so
 *  new POS categories surface instead of silently disappearing. */
const warnedTypes = new Set<string>();
function slugForType(productType: string | null | undefined): string {
  const key = (productType ?? "").trim().toLowerCase();
  if (!key) return "collections";
  const mapped = TYPE_TO_SLUG[key];
  if (mapped) return mapped;
  if (!warnedTypes.has(key)) {
    warnedTypes.add(key);
    console.warn(`Unmapped POS product_type "${productType}" — add it to TYPE_TO_SLUG.`);
  }
  return key.replace(/\s+/g, "-");
}

const SIZE_LABEL: Record<string, string> = {
  rings: "Ring Size",
  "gold-rings": "Ring Size",
  bracelets: "Length",
  "gold-bracelets": "Length",
  earrings: "Size",
  "gold-earrings": "Size",
  "nose-pins": "Size",
  pendants: "Chain Length",
  "gold-pendants": "Chain Length",
  necklaces: "Chain Length",
  "gold-necklaces": "Chain Length",
  tanmaniya: "Chain Length",
};


const stripHtml = (s: string | null | undefined) =>
  (s ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const pickOption = (
  options: Record<string, string[]> | null,
  keys: string[],
): string[] | undefined => {
  if (!options) return undefined;
  for (const k of Object.keys(options)) {
    if (keys.some((want) => k.toLowerCase() === want.toLowerCase())) {
      const v = options[k];
      if (Array.isArray(v) && v.length) return v;
    }
  }
  return undefined;
};

function mapRow(row: CatalogRow): Product {
  const slug =
    TYPE_TO_SLUG[(row.product_type ?? "").toLowerCase()] ?? "collections";

  const metalOptions =
    pickOption(row.options, ["Color", "Colour", "Metal", "Metal Colour"]) ??
    ["Yellow Gold", "White Gold", "Rose Gold"];
  const purityOptions =
    pickOption(row.options, ["Purity", "Karat", "Metal Purity"]) ??
    ["14 KT", "18 KT"];
  const sizes = pickOption(row.options, ["Size", "Ring Size", "Length"]);

  // Map option names to their positions (Shopify stores options as option1, option2, option3)
  const optionNames = Object.keys(row.options ?? {});
  const colorOptionKey = optionNames.find((key) =>
    ["Color", "Colour", "Metal", "Metal Colour"].some(
      (name) => key.toLowerCase() === name.toLowerCase(),
    ),
  );
  const purityOptionKey = optionNames.find((key) =>
    ["Purity", "Karat", "Metal Purity"].some(
      (name) => key.toLowerCase() === name.toLowerCase(),
    ),
  );
  const sizeOptionKey = optionNames.find((key) =>
    ["Size", "Ring Size", "Length"].some(
      (name) => key.toLowerCase() === name.toLowerCase(),
    ),
  );

  const rawVariants = (row.variants ?? []) as Array<Record<string, unknown>>;

  // Variant rows may key attributes by the option name ("Karat"), a lowercase
  // form ("karat"), or a synonym ("purity"/"metal"). Resolve case-insensitively
  // across every candidate so a naming mismatch never silently drops a facet.
  const readAttr = (
    v: Record<string, unknown>,
    optionKey: string | undefined,
    aliases: string[],
  ): string | undefined => {
    const wanted = [optionKey, ...aliases].filter(Boolean).map((k) => (k as string).toLowerCase());
    for (const key of Object.keys(v)) {
      if (wanted.includes(key.toLowerCase())) {
        const val = v[key];
        if (val != null && String(val).trim() !== "") return String(val);
      }
    }
    return undefined;
  };

  const variants = rawVariants.map((v) => ({
    size: readAttr(v, sizeOptionKey, ["size", "ring size", "length", "option1"]),
    color: readAttr(v, colorOptionKey, ["color", "colour", "metal", "metal colour", "option2"]),
    purity: readAttr(v, purityOptionKey, ["purity", "karat", "carat", "metal purity", "option3"]),
    price: Number(v.price) || 0,
    mrp:
      v.compare_at_price != null && Number(v.compare_at_price) > 0
        ? Number(v.compare_at_price)
        : undefined,
    sku: String(
      (v.sku as string | undefined) ??
        (v.variant_id as string | number | undefined) ??
        (v.id as string | number | undefined) ??
        row.handle ??
        row.id,
    ),
  }));

  const firstVariant = rawVariants[0] as
    | { sku?: string; variant_id?: string | number; id?: string | number }
    | undefined;
  const sku =
    (firstVariant?.sku as string) ??
    (firstVariant?.variant_id?.toString?.() ??
      firstVariant?.id?.toString?.() ??
      row.handle ??
      row.id);

  const image = row.image_url ?? "";
  const variantPrices = variants.map((v) => v.price).filter((p) => p > 0);
  const minVariantPrice = variantPrices.length ? Math.min(...variantPrices) : 0;
  const price =
    minVariantPrice ||
    row.base_price ||
    Number((row.display_price ?? "").replace(/[^\d.]/g, "")) ||
    0;
  const mrp = row.compare_at_price ?? undefined;

  return {
    id: row.handle ?? row.id,
    name: row.title,
    category: slug,
    price: Number(price) || 0,
    mrp: mrp && mrp > 0 ? Number(mrp) : undefined,
    carats: "",
    metal: metalOptions[0],
    metalOptions,
    purityOptions,
    sizes,
    sizeLabel: sizes ? SIZE_LABEL[slug] ?? "Size" : undefined,
    image,
    gallery: image ? [image] : [],
    description: stripHtml(row.description) || row.title,
    sku,
    weightGm: 0,
    diamondCt: 0,
    tags: row.tags ?? [],
    variants: variants.length ? variants : undefined,
  };
}
/** Active promotional schemes configured in the POS Scheme Config Master. */
export async function fetchActiveSchemes(): Promise<Scheme[]> {
  try {
    const { data, error } = await posSupabase
      .from("schemes")
      .select("*")
      .eq("status", "active");
    if (error) throw error;
    return (data ?? []) as Scheme[];
  } catch (err) {
    console.warn("Failed to fetch schemes:", err);
    return [];
  }
}

/** Attach the winning scheme (same rules as POS Catalog Master) to a product. */
function applySchemes(product: Product, row: CatalogRow, schemes: Scheme[]): Product {
  const basePrice = row.base_price ?? product.price;
  if (!basePrice || schemes.length === 0) return product;

  const result = evaluateApplicableSchemes(
    {
      productId: row.id,
      productName: row.title,
      category: row.product_type ?? "",
      basePrice,
    },
    schemes,
  );

  if (!result || result.discountAmount <= 0) return product;

  product.appliedScheme = result.scheme;
  product.offer = {
    schemeName: result.scheme.name,
    bannerText: result.scheme.name,
    badgeText: "Offer Valid",
    discountAmount: result.discountAmount,
    discountPercent:
      result.scheme.discount_type === "percentage"
        ? result.scheme.discount_value
        : Math.round((result.discountAmount / basePrice) * 100),
    offerPrice: result.effectivePrice,
    validFrom: result.scheme.start_date,
    validTo: result.scheme.end_date,
  };
  return product;
}

export async function fetchProductsByCategory(slug: string): Promise<Product[]> {
  const [{ data, error }, schemes] = await Promise.all([
    posSupabase
      .from("catalog_products")
      .select(SELECT)
      .eq("status", "active")
      .order("sort_order", { ascending: true }),
    fetchActiveSchemes(),
  ]);
  if (error) throw error;

  const rows = (data ?? []) as CatalogRow[];

  return rows
    .filter((r) => TYPE_TO_SLUG[(r.product_type ?? "").toLowerCase()] === slug)
    .map((row) => applySchemes(mapRow(row), row, schemes));
}

export async function fetchProductByHandle(handle: string): Promise<Product | null> {
  // Try handle first, then id
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(handle);
  const [{ data, error }, schemes] = await Promise.all([
    posSupabase
      .from("catalog_products")
      .select(SELECT)
      .eq("status", "active")
      .eq(isUuid ? "id" : "handle", handle)
      .maybeSingle(),
    fetchActiveSchemes(),
  ]);
  if (error) throw error;
  if (!data) return null;

  const row = data as CatalogRow;
  return applySchemes(mapRow(row), row, schemes);
}

export async function fetchRelated(
  category: string,
  excludeId: string,
  limit = 4,
): Promise<Product[]> {
  const items = await fetchProductsByCategory(category);
  return items.filter((p) => p.id !== excludeId).slice(0, limit);
}

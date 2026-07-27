import type { Product } from "./catalog";

export type Filters = {
  min: number;
  max: number;
  purity: string[];
  color: string[];
  size: string[];
  carat: string[];
  shopFor: string[];
};

export const emptyFilters: Filters = {
  min: 0,
  max: 0,
  purity: [],
  color: [],
  size: [],
  carat: [],
  shopFor: [],
};

export const CARAT_BUCKETS = [
  "Below 1 carat",
  "1-2 carat",
  "2-3 carat",
  "3 carat & above",
] as const;

/** All prices a product can be bought at (variants, else base price). */
export function productPrices(p: Product): number[] {
  const vp = (p.variants ?? []).map((v) => v.price).filter((n) => n > 0);
  return vp.length ? vp : p.price > 0 ? [p.price] : [];
}

export function maxPrice(products: Product[]): number {
  const all = products.flatMap(productPrices);
  return all.length ? Math.ceil(Math.max(...all)) : 0;
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

export function caratOf(p: Product): string | undefined {
  const tags = (p.tags ?? []).map(norm);
  if (tags.some((t) => t.includes("below 1 carat"))) return "Below 1 carat";
  if (tags.some((t) => t.includes("3 carat"))) return "3 carat & above";
  if (tags.some((t) => t.includes("2-3 carat") || t.includes("2 - 3 carat")))
    return "2-3 carat";
  if (tags.some((t) => t.includes("1-2 carat") || t.includes("1 - 2 carat")))
    return "1-2 carat";
  const ct = p.diamondCt;
  if (ct > 0) {
    if (ct < 1) return "Below 1 carat";
    if (ct < 2) return "1-2 carat";
    if (ct < 3) return "2-3 carat";
    return "3 carat & above";
  }
  return undefined;
}

export function shopForOf(p: Product): string | undefined {
  const hay = norm([...(p.tags ?? []), p.name].join(" "));
  const her = /ladies|women|womens|woman|her\b/.test(hay);
  const him = /\bmens\b|\bmen\b|\bhim\b|gents/.test(hay);
  if (him && !her) return "Him";
  if (her && !him) return "Her";
  return undefined;
}

export type Facets = {
  maxPrice: number;
  purity: string[];
  color: string[];
  size: string[];
  carat: string[];
  shopFor: string[];
};

const uniq = (values: (string | undefined)[]) =>
  Array.from(new Set(values.filter((v): v is string => !!v && v.trim() !== "")));

export function buildFacets(products: Product[]): Facets {
  const purity = uniq(
    products.flatMap((p) => [
      ...p.purityOptions,
      ...(p.variants ?? []).map((v) => v.purity),
    ]),
  ).sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));

  const color = uniq(
    products.flatMap((p) => [
      ...p.metalOptions,
      ...(p.variants ?? []).map((v) => v.color),
    ]),
  ).sort();

  const size = uniq(
    products.flatMap((p) => [
      ...(p.sizes ?? []),
      ...(p.variants ?? []).map((v) => v.size),
    ]),
  ).sort((a, b) => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });

  const caratSet = new Set(products.map(caratOf).filter(Boolean) as string[]);
  const carat = CARAT_BUCKETS.filter((c) => caratSet.has(c));

  const shopFor = ["Her", "Him"].filter((g) =>
    products.some((p) => shopForOf(p) === g),
  );

  return { maxPrice: maxPrice(products), purity, color, size, carat, shopFor };
}

const hasAny = (selected: string[], values: (string | undefined)[]) =>
  selected.length === 0 ||
  values.some((v) => v && selected.some((s) => norm(s) === norm(v)));

/** The price shown on the card: the product's own price, else its lowest variant price. */
export function displayPrice(p: Product): number | undefined {
  if (p.price > 0) return p.price;
  const prices = productPrices(p);
  return prices.length ? Math.min(...prices) : undefined;
}

export function matches(p: Product, f: Filters, facetMax: number): boolean {
  const max = f.max > 0 ? f.max : facetMax;
  const price = displayPrice(p);
  if (price !== undefined && (price < f.min || price > max)) return false;

  if (
    !hasAny(f.purity, [
      ...p.purityOptions,
      ...(p.variants ?? []).map((v) => v.purity),
    ])
  )
    return false;

  if (
    !hasAny(f.color, [
      ...p.metalOptions,
      ...(p.variants ?? []).map((v) => v.color),
    ])
  )
    return false;

  if (
    !hasAny(f.size, [...(p.sizes ?? []), ...(p.variants ?? []).map((v) => v.size)])
  )
    return false;

  if (f.carat.length && !hasAny(f.carat, [caratOf(p)])) return false;
  if (f.shopFor.length && !hasAny(f.shopFor, [shopForOf(p)])) return false;

  return true;
}

export function applyFilters(products: Product[], f: Filters, facetMax: number) {
  return products.filter((p) => matches(p, f, facetMax));
}

/** Count of products matching all filters except `key`, for a given option. */
export function optionCount(
  products: Product[],
  f: Filters,
  facetMax: number,
  key: keyof Omit<Filters, "min" | "max">,
  option: string,
): number {
  const probe: Filters = { ...f, [key]: [option] } as Filters;
  return products.filter((p) => matches(p, probe, facetMax)).length;
}

export const isActive = (f: Filters, facetMax: number) =>
  f.min > 0 ||
  (f.max > 0 && f.max < facetMax) ||
  f.purity.length > 0 ||
  f.color.length > 0 ||
  f.size.length > 0 ||
  f.carat.length > 0 ||
  f.shopFor.length > 0;

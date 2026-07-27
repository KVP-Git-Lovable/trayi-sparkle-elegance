import { createFileRoute, notFound, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { CollectionFilters } from "@/components/collection-filters";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { categories, type Product } from "@/lib/catalog";
import { fetchProductsByCategory } from "@/lib/remote-catalog";
import {
  applyFilters,
  buildFacets,
  type Filters,
} from "@/lib/product-filters";

type Search = {
  min?: number;
  max?: number;
  purity?: string;
  color?: string;
  size?: string;
  carat?: string;
  shopFor?: string;
};

const toList = (v: string | undefined): string[] =>
  v && v.trim() !== "" ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];

const str = (v: unknown): string | undefined => {
  const s = typeof v === "string" ? v.trim() : Array.isArray(v) ? v.join(",") : "";
  return s ? s : undefined;
};

export const Route = createFileRoute("/collections/$category")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    min: Number(search.min) > 0 ? Number(search.min) : undefined,
    max: Number(search.max) > 0 ? Number(search.max) : undefined,
    purity: str(search.purity),
    color: str(search.color),
    size: str(search.size),
    carat: str(search.carat),
    shopFor: str(search.shopFor),
  }),

  loader: async ({ params }) => {
    const category = categories.find((c) => c.slug === params.category);
    if (!category) throw notFound();
    const products = await fetchProductsByCategory(category.slug);
    return { category, products };
  },

  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.category.name} — Trayi Jewellery` },
          { name: "description", content: `${loaderData.category.tagline}. Certified LimeLight lab-grown diamond ${loaderData.category.name.toLowerCase()} at Trayi, Mangalore.` },
          { property: "og:title", content: `${loaderData.category.name} — Trayi Jewellery` },
          { property: "og:description", content: loaderData.category.tagline },
          { property: "og:image", content: loaderData.category.image },
        ]
      : [{ title: "Collection — Trayi Jewellery" }, { name: "robots", content: "noindex" }],
  }),
  component: CategoryPage,
  errorComponent: ({ error }) => (
    <div className="p-16 text-center text-sm text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-display text-4xl">Collection not found</h1>
        <Link to="/collections" className="mt-6 inline-block text-accent underline-offset-4 hover:underline">Browse all collections</Link>
      </div>
      <SiteFooter />
    </div>
  ),
});

function CategoryPage() {
  const { category, products } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/collections/$category" });
  const [sheetOpen, setSheetOpen] = useState(false);

  const facets = useMemo(() => buildFacets(products), [products]);
  const filters: Filters = {
    min: search.min ?? 0,
    max: search.max ?? 0,
    purity: toList(search.purity),
    color: toList(search.color),
    size: toList(search.size),
    carat: toList(search.carat),
    shopFor: toList(search.shopFor),
  };

  const visible = useMemo(
    () => applyFilters(products, filters, facets.maxPrice),
    [products, search, facets.maxPrice],
  );

  const onChange = (next: Partial<Filters>) => {
    const merged: Filters = { ...filters, ...next };
    const list = (v: string[]) => (v.length ? v.join(",") : undefined);
    navigate({
      params: { category: category.slug },
      search: {
        min: merged.min > 0 ? merged.min : undefined,
        max:
          merged.max > 0 && merged.max < facets.maxPrice ? merged.max : undefined,
        purity: list(merged.purity),
        color: list(merged.color),
        size: list(merged.size),
        carat: list(merged.carat),
        shopFor: list(merged.shopFor),
      },
      replace: true,
      resetScroll: false,
    });
  };


  const onClear = () =>
    navigate({
      params: { category: category.slug },
      search: {} as never,
      replace: true,
      resetScroll: false,
    });

  const sidebar = (
    <CollectionFilters
      products={products}
      facets={facets}
      filters={filters}
      onChange={onChange}
      onClear={onClear}
    />
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative">
        <div className="aspect-[16/6] overflow-hidden">
          <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/60" />
        </div>
        <div className="mx-auto max-w-7xl px-6 -mt-24 relative text-center">
          <div className="inline-block bg-background px-10 py-8">
            <span className="eyebrow">Collection</span>
            <h1 className="mt-3 font-display text-5xl md:text-6xl">{category.name}</h1>
            <p className="mt-3 text-muted-foreground">{category.tagline}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            New pieces arriving soon. Visit our boutique for the full range.
          </p>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-28">{sidebar}</div>
            </aside>

            <div className="min-w-0">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border/60 pb-4">
                <p className="min-w-0 truncate text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {visible.length} {visible.length === 1 ? "piece" : "pieces"}
                </p>
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <button className="lg:hidden inline-flex shrink-0 items-center gap-2 border border-border px-4 py-2 text-[11px] uppercase tracking-[0.22em]">
                      <SlidersHorizontal className="h-4 w-4" /> Filters
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto px-6 py-10">
                    {sidebar}
                  </SheetContent>
                </Sheet>
              </div>

              {visible.length === 0 ? (
                <div className="py-24 text-center">
                  <p className="text-muted-foreground">No pieces match these filters.</p>
                  <button
                    onClick={onClear}
                    className="mt-4 text-[11px] uppercase tracking-[0.22em] text-accent hover:underline underline-offset-4"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                  {visible.map((p: Product) => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}


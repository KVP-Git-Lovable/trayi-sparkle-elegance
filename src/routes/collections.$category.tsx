import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { categories, products } from "@/lib/catalog";

export const Route = createFileRoute("/collections/$category")({
  loader: ({ params }) => {
    const cat = categories.find((c) => c.slug === params.category);
    if (!cat) throw notFound();
    return { category: cat };
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
  const { category } = Route.useLoaderData();
  const items = products.filter((p) => p.category === category.slug);
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
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            New pieces arriving soon. Visit our boutique for the full range.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}

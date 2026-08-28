import { useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { fetchAllProducts } from "@/lib/remote-catalog";
import type { Product } from "@/lib/catalog";

const SEARCH_ITEMS = [
  { id: "collections", label: "All Collections", to: "/collections", type: "section" },
  { id: "rings", label: "Rings", to: "/collections/$category", params: { category: "rings" }, type: "category" },
  { id: "earrings", label: "Earrings", to: "/collections/$category", params: { category: "earrings" }, type: "category" },
  { id: "pendants", label: "Pendants", to: "/collections/$category", params: { category: "pendants" }, type: "category" },
  { id: "necklaces", label: "Necklaces", to: "/collections/$category", params: { category: "necklaces" }, type: "category" },
  { id: "bracelets", label: "Bracelets", to: "/collections/$category", params: { category: "bracelets" }, type: "category" },
  { id: "bridal", label: "Bridal", to: "/collections/$category", params: { category: "bridal" }, type: "category" },
  { id: "tanmaniya", label: "Tanmaniya", to: "/collections/$category", params: { category: "tanmaniya" }, type: "category" },
  { id: "education", label: "Lab-Grown Diamonds 101", to: "/education", type: "section" },
  { id: "about", label: "Our Story", to: "/about", type: "section" },
  { id: "contact", label: "Visit Us", to: "/contact", type: "section" },
];

interface SearchItem {
  id: string;
  label: string;
  to: string;
  params?: Record<string, string>;
  type: string;
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>(SEARCH_ITEMS);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);

  useEffect(() => {
    if (!productsLoaded) {
      setLoading(true);
      fetchAllProducts()
        .then((prods) => {
          setProducts(prods);
          setProductsLoaded(true);
        })
        .catch((err) => {
          console.error("Failed to fetch products:", err);
          setProductsLoaded(true);
        })
        .finally(() => setLoading(false));
    }
  }, [productsLoaded]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(SEARCH_ITEMS);
      return;
    }

    const searchQuery = query.toLowerCase();

    // Search in static items
    const staticResults = SEARCH_ITEMS.filter((item) =>
      item.label.toLowerCase().includes(searchQuery)
    );

    // Search in products
    const productResults = products
      .filter((p) => p.name.toLowerCase().includes(searchQuery))
      .map((p) => ({
        id: p.id,
        label: p.name,
        to: `/product/$productId`,
        params: { productId: p.id },
        type: "product",
      }));

    setResults([...staticResults, ...productResults]);
  }, [query, products]);

  const handleClose = () => {
    setOpen(false);
    setQuery("");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="hover:text-accent transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="text-accent"
      >
        <Search className="h-4 w-4" />
      </button>

      <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={handleClose} />

      <div className="absolute left-0 right-0 top-full mt-0 z-50 bg-background border-b border-border/60 w-full">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="relative">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Search collections, pages..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={handleClose}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {open && (
              <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                {loading && !productsLoaded ? (
                  <div className="px-3 py-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading products...
                  </div>
                ) : results.length > 0 ? (
                  results.map((item) => {
                    const isProduct = item.type === "product";
                    return (
                      <Link
                        key={item.id}
                        to={isProduct ? `/product/$productId` : item.to}
                        params={isProduct ? { productId: item.id } : (item.params as never)}
                        onClick={handleClose}
                        className="block px-3 py-2 rounded hover:bg-muted/60 transition-colors text-sm"
                      >
                        <div className="font-medium text-foreground">{item.label}</div>
                        <div className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">
                          {item.type}
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                    No results found for "{query}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

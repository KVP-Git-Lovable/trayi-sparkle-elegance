import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { posSupabase } from "./pos-supabase";

interface FilterVisibilityContextType {
  showPriceFilter: boolean;
  showColourFilter: boolean;
  loading: boolean;
}

const FilterVisibilityContext = createContext<FilterVisibilityContextType | undefined>(undefined);

/**
 * The config value may be stored as a JSON boolean, a string, or a number.
 * Anything explicitly falsy ("false", false, "hide", "0", "no") hides the filter.
 * Missing rows default to visible.
 */
function parseFlag(value: unknown, fallback = true): boolean {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase().replace(/^"|"$/g, "");
    if (["false", "hide", "hidden", "0", "no", "off"].includes(v)) return false;
    if (["true", "show", "visible", "1", "yes", "on"].includes(v)) return true;
    return fallback;
  }
  return fallback;
}

export function FilterVisibilityProvider({ children }: { children: ReactNode }) {
  const [showPriceFilter, setShowPriceFilter] = useState(true);
  const [showColourFilter, setShowColourFilter] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilterSettings = async () => {
      try {
        const { data: priceFilterData, error: priceError } = await posSupabase
          .from("website_config")
          .select("value")
          .eq("key", "price_filter_visible")
          .maybeSingle();

        const { data: colourFilterData, error: colourError } = await posSupabase
          .from("website_config")
          .select("value")
          .eq("key", "colour_filter_visible")
          .maybeSingle();

        if (!priceError) {
          setShowPriceFilter(parseFlag(priceFilterData?.value));
        }

        if (!colourError) {
          setShowColourFilter(parseFlag(colourFilterData?.value));
        }
      } catch (error) {
        console.warn("Failed to fetch filter visibility settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterSettings();
  }, []);

  return (
    <FilterVisibilityContext.Provider value={{ showPriceFilter, showColourFilter, loading }}>
      {children}
    </FilterVisibilityContext.Provider>
  );
}

export function useFilterVisibility() {
  const context = useContext(FilterVisibilityContext);
  if (context === undefined) {
    throw new Error("useFilterVisibility must be used within FilterVisibilityProvider");
  }
  return context;
}

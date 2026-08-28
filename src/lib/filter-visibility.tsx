import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { posSupabase } from "./pos-supabase";

interface FilterVisibilityContextType {
  showPriceFilter: boolean;
  showColourFilter: boolean;
  loading: boolean;
}

const FilterVisibilityContext = createContext<FilterVisibilityContextType | undefined>(undefined);

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
          // Default to true (show) if not set or if value is not "false"
          setShowPriceFilter(priceFilterData?.value !== "false");
        }

        if (!colourError) {
          // Default to true (show) if not set or if value is not "false"
          setShowColourFilter(colourFilterData?.value !== "false");
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

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { posSupabase } from "./pos-supabase";

type PriceVisibilityCtx = {
  hidePrices: boolean;
  loading: boolean;
};

const Ctx = createContext<PriceVisibilityCtx>({ hidePrices: false, loading: true });

export function PriceVisibilityProvider({ children }: { children: ReactNode }) {
  const [hidePrices, setHidePrices] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    posSupabase
      .from("website_config")
      .select("value")
      .eq("key", "price_display")
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn("Failed to load price visibility config:", error);
        } else {
          setHidePrices(data?.value === "hide");
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Ctx.Provider value={{ hidePrices, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePriceVisibility() {
  return useContext(Ctx);
}

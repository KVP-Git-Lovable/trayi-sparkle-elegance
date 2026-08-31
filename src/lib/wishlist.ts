import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { Product } from "@/lib/catalog";

export type WishlistRow = {
  id: string;
  product_handle: string;
  product_title: string | null;
  product_image: string | null;
  product_price: number | null;
};

export function useWishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistRow[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("wishlist_items")
      .select("id, product_handle, product_title, product_image, product_price")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data as WishlistRow[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const has = (handle: string) => items.some((i) => i.product_handle === handle);

  const toggle = async (product: Product, price?: number) => {
    if (!user) return "unauthenticated" as const;

    if (has(product.id)) {
      // Optimistic: Remove from local state immediately
      setItems(prev => prev.filter(i => i.product_handle !== product.id));

      // Background: Delete from database
      void (async () => {
        const { error } = await supabase
          .from("wishlist_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_handle", product.id);
        if (error) {
          console.error("Failed to remove from wishlist:", error);
          void refresh();
        }
      })();


      return "removed" as const;
    }

    // Optimistic: Add to local state immediately with temporary ID
    const tempId = `temp-${product.id}-${Date.now()}`;
    const newItem: WishlistRow = {
      id: tempId,
      product_handle: product.id,
      product_title: product.name,
      product_image: product.image,
      product_price: price ?? product.price,
    };
    setItems(prev => [newItem, ...prev]);

    // Background: Insert into database and refresh if needed
    supabase
      .from("wishlist_items")
      .insert({
        user_id: user.id,
        product_handle: product.id,
        product_title: product.name,
        product_image: product.image,
        product_price: price ?? product.price,
      })
      .then(() => {
        // Optional: refresh to get real ID and ensure sync, or skip if confident
      })
      .catch(error => {
        console.error("Failed to add to wishlist:", error);
        // Revert on error by refreshing
        void refresh();
      });

    return "added" as const;
  };

  const remove = async (handle: string) => {
    if (!user) return;

    // Optimistic: Remove from local state immediately
    setItems(prev => prev.filter(i => i.product_handle !== handle));

    // Background: Delete from database
    supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_handle", handle)
      .catch(error => {
        console.error("Failed to remove from wishlist:", error);
        // Revert on error by refreshing
        void refresh();
      });
  };

  return { items, loading, has, toggle, remove, refresh };
}

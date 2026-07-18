import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getProduct, type Product } from "./catalog";

export type CartItem = {
  productId: string;
  qty: number;
  size?: string;
  metal?: string;
  purity?: string;
};

type CartCtx = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (index: number) => void;
  setQty: (index: number, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  hydrated: boolean;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "trayi_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
    }
  }, [items, hydrated]);

  const add = (item: CartItem) => {
    setItems((prev) => {
      const i = prev.findIndex(
        (p) => p.productId === item.productId && p.size === item.size &&
               p.metal === item.metal && p.purity === item.purity
      );
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + item.qty };
        return copy;
      }
      return [...prev, item];
    });
  };
  const remove = (index: number) => setItems((p) => p.filter((_, i) => i !== index));
  const setQty = (index: number, qty: number) =>
    setItems((p) => p.map((it, i) => (i === index ? { ...it, qty: Math.max(1, qty) } : it)));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => {
    const p = getProduct(i.productId);
    return s + (p ? p.price * i.qty : 0);
  }, 0);

  return (
    <Ctx.Provider value={{ items, add, remove, setQty, clear, count, subtotal, hydrated }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}

export function itemProduct(item: CartItem): Product | undefined {
  return getProduct(item.productId);
}

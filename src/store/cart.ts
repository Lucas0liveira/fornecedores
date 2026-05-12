"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem } from "@/lib/types";

interface CartStore {
  supplierId: string | null;
  items: Record<number, CartItem>;
  add: (product: Product, qty: number) => boolean;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      supplierId: null,
      items: {},

      add: (product, qty) => {
        const { supplierId, items } = get();
        if (
          supplierId &&
          supplierId !== product.supplier_id &&
          Object.keys(items).length > 0
        ) {
          // Caller must confirm before calling add again after clearing
          return false;
        }
        set((s) => {
          const existing = s.items[product.id];
          const newQty = (existing?.qty ?? 0) + qty;
          return {
            supplierId: product.supplier_id,
            items: {
              ...s.items,
              [product.id]: { product, qty: newQty },
            },
          };
        });
        return true;
      },

      setQty: (productId, qty) => {
        set((s) => {
          const items = { ...s.items };
          if (qty <= 0) {
            delete items[productId];
          } else {
            items[productId] = { ...items[productId], qty };
          }
          const supplierId = Object.keys(items).length > 0 ? s.supplierId : null;
          return { items, supplierId };
        });
      },

      remove: (productId) => get().setQty(productId, 0),

      clear: () => set({ supplierId: null, items: {} }),

      count: () =>
        Object.values(get().items).reduce((s, it) => s + it.qty, 0),

      subtotal: () =>
        Object.values(get().items).reduce(
          (s, it) => s + it.qty * it.product.price,
          0
        ),
    }),
    {
      name: "logsim.cart.v1",
    }
  )
);

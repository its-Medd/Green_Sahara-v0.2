import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const existing = get().items.find((item) => item.id === product.id);
        if (existing) {
          set({
            items: get().items.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + Number(quantity) } : item
            )
          });
        } else {
          set({ items: [...get().items, { ...product, quantity: Number(quantity) }] });
        }
      },
      updateQuantity: (id, quantity) => {
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, Number(quantity)) } : item
          )
        });
      },
      clearCart: () => set({ items: [] }),
      removeItem: (id) => set({ items: get().items.filter((item) => item.id !== id) })
    }),
    { name: "green-sahara-cart" }
  )
);


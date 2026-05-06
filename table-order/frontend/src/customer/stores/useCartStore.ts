import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Menu } from '@shared/api/types';

interface CartState {
  items: CartItem[];
}

interface CartActions {
  addItem: (menu: Menu) => void;
  removeItem: (menuId: string) => void;
  updateQuantity: (menuId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getItemCount: (menuId: string) => number;
}

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // State
      items: [],

      // Actions
      addItem: (menu: Menu) => {
        set((state) => {
          const menuIdStr = String(menu.id);
          const existing = state.items.find((item) => item.menuId === menuIdStr);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.menuId === menuIdStr
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                menuId: menuIdStr,
                menuName: menu.name,
                price: menu.price,
                quantity: 1,
                imageUrl: menu.image_url,
              },
            ],
          };
        });
      },

      removeItem: (menuId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.menuId !== menuId),
        }));
      },

      updateQuantity: (menuId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(menuId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.menuId === menuId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getItemCount: (menuId: string) =>
        get().items.find((item) => item.menuId === menuId)?.quantity || 0,
    }),
    {
      name: 'table-order-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

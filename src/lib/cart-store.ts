import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            if (existing.quantity >= item.stock) {
              toast.error(`Only ${item.stock} available in stock`);
              return state;
            }
            const updatedItems = state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1, stock: item.stock } : i
            );
            toast.success(`${item.name} quantity updated in cart`);
            return { items: updatedItems };
          }
          if (item.stock <= 0) {
            toast.error('This product is out of stock');
            return state;
          }
          toast.success(`${item.name} added to cart`);
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) return { items: state.items.filter((i) => i.id !== id) };
          const item = state.items.find((i) => i.id === id);
          if (item && quantity > item.stock) {
            toast.error(`Only ${item.stock} available in stock`);
            return state;
          }
          return { items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)) };
        }),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setCartOpen: (open) => set({ isOpen: open }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'cart-storage', // unique name for localStorage key
    }
  )
);

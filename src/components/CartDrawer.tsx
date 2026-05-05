import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, totalPrice } = useCartStore();
  const navigate = useNavigate();

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex flex-col h-[100dvh]! w-full sm:max-w-sm overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 ai-shimmer" />
        <SheetHeader>
          <SheetTitle style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Your Cart 🛒</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 mt-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-muted/50 ai-glow-hover transition-all duration-300">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-sm font-bold text-primary">Rs. {item.price.toFixed(0)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto text-destructive"
                        onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-4 space-y-4 flex-shrink-0 ai-shimmer rounded-xl p-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="ai-text-gradient">Rs. {totalPrice().toFixed(0)}</span>
              </div>
              <Button
                className="w-full rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                size="lg"
                onClick={() => {
                  setCartOpen(false);
                  navigate('/checkout');
                }}
              >
                Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;

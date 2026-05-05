import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Package, Search, ShoppingBag } from 'lucide-react';
import { api } from '@/lib/api';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'sonner';

interface Bundle {
  id: string;
  name: string;
  image_url: string;
  min_items: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discount_price?: number | string | null;
  image_url: string | null;
  image_urls?: string[];
  stock: number;
  category?: string;
  is_active?: boolean;
}

interface Props {
  bundle: Bundle | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const getEffectivePrice = (p: Product): number => {
  const disc = Number(p.discount_price);
  const orig = Number(p.price);
  if (disc > 0 && disc < orig) return disc;
  return orig;
};

const BundleDialog = ({ bundle, open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setCartOpen);

  useEffect(() => {
    if (!open) return;
    setSelected({});
    setSearch('');
    const load = async () => {
      setLoading(true);
      const res = await api.getProducts();
      if (res.data) {
        setProducts((res.data as Product[]).filter((p) => p.is_active !== false && p.stock > 0));
      }
      setLoading(false);
    };
    load();
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  const totalSelected = useMemo(
    () => Object.values(selected).reduce((sum, q) => sum + q, 0),
    [selected]
  );

  const totalPrice = useMemo(() => {
    return products.reduce((sum, p) => {
      const qty = selected[p.id] || 0;
      return sum + qty * getEffectivePrice(p);
    }, 0);
  }, [products, selected]);

  const minItems = bundle?.min_items || 1;
  const meetsMin = totalSelected >= minItems;

  const toggle = (p: Product) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[p.id]) delete next[p.id];
      else next[p.id] = 1;
      return next;
    });
  };

  const updateQty = (p: Product, delta: number) => {
    setSelected((prev) => {
      const cur = prev[p.id] || 0;
      const nextQty = Math.min(p.stock, Math.max(0, cur + delta));
      const next = { ...prev };
      if (nextQty <= 0) delete next[p.id];
      else next[p.id] = nextQty;
      return next;
    });
  };

  const handleProceed = () => {
    if (!meetsMin) {
      toast.error(`Please select at least ${minItems} items to build this bundle`);
      return;
    }
    products.forEach((p) => {
      const qty = selected[p.id] || 0;
      for (let i = 0; i < qty; i++) {
        addItem({
          id: p.id,
          name: p.name,
          price: getEffectivePrice(p),
          image: p.image_urls?.[0] || p.image_url || '',
          stock: p.stock,
        });
      }
    });
    onOpenChange(false);
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <Package className="h-5 w-5 text-primary" />
            {bundle?.name || 'Build Your Bundle'}
          </DialogTitle>
          <DialogDescription>
            Pick at least <span className="font-semibold text-foreground">{minItems}</span>{' '}
            {minItems === 1 ? 'item' : 'items'} to complete this bundle.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading products...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No products found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((p) => {
                const qty = selected[p.id] || 0;
                const isSelected = qty > 0;
                const price = getEffectivePrice(p);
                return (
                  <div
                    key={p.id}
                    className={`relative rounded-xl border-2 overflow-hidden transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/30 shadow-md'
                        : 'border-border hover:border-primary/40'
                    }`}
                    onClick={() => toggle(p)}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 z-10 h-6 w-6 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground flex items-center justify-center shadow">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div className="aspect-square bg-muted overflow-hidden">
                      <img
                        src={p.image_urls?.[0] || p.image_url || '/placeholder.svg'}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{p.name}</p>
                      <p className="text-sm font-bold text-primary">Rs. {price.toFixed(0)}</p>
                      {isSelected && (
                        <div
                          className="flex items-center justify-between mt-2 bg-muted/60 rounded-full px-1 py-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="h-6 w-6 rounded-full bg-background border text-sm font-bold hover:bg-muted"
                            onClick={() => updateQty(p, -1)}
                          >
                            −
                          </button>
                          <span className="text-xs font-semibold">{qty}</span>
                          <button
                            type="button"
                            className="h-6 w-6 rounded-full bg-background border text-sm font-bold hover:bg-muted disabled:opacity-50"
                            onClick={() => updateQty(p, 1)}
                            disabled={qty >= p.stock}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t p-4 sm:p-6 bg-background">
          <div className="flex items-center justify-between mb-3 text-sm">
            <div>
              <p className="text-muted-foreground">
                Selected:{' '}
                <span className={`font-bold ${meetsMin ? 'text-green-600' : 'text-destructive'}`}>
                  {totalSelected}
                </span>{' '}
                / {minItems} min
              </p>
              {!meetsMin && (
                <p className="text-xs text-destructive mt-0.5">
                  Add {minItems - totalSelected} more {minItems - totalSelected === 1 ? 'item' : 'items'} to continue
                </p>
              )}
            </div>
            <p className="font-bold text-lg">Rs. {totalPrice.toFixed(0)}</p>
          </div>
          <Button
            size="lg"
            disabled={!meetsMin}
            onClick={handleProceed}
            className="w-full rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Proceed to Checkout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BundleDialog;

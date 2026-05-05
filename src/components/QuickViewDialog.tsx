import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';
import { ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number | string;
  discount_price?: number | string | null;
  image_urls: string[];
  stock: number;
  category: string;
  is_active: boolean;
  created_at: string;
  sold?: number;
}

interface QuickViewDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuickViewDialog = ({ product, open, onOpenChange }: QuickViewDialogProps) => {
  const [qty, setQty] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const isMobile = useIsMobile();

  const getDiscountPrice = (p: Product): number => {
    if (!p.discount_price) return 0;
    const price = Number(p.discount_price);
    return isNaN(price) || price <= 0 ? 0 : price;
  };

  useEffect(() => {
    if (open) {
      setQty(1);
      setSelectedImageIndex(0);
    }
  }, [open]);

  const allImages = product?.image_urls && product.image_urls.length > 0
    ? product.image_urls
    : ['/placeholder.svg'];

  const getEffectivePrice = (p: Product) => {
    const productPrice = Number(p.price);
    const discPrice = getDiscountPrice(p);
    return discPrice > 0 && discPrice < productPrice ? discPrice : productPrice;
  };

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    const effectivePrice = getEffectivePrice(product);
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: Number(effectivePrice),
        image: product.image_urls?.[0] || '',
        stock: product.stock,
      });
    }
    onOpenChange(false);
  }, [product, qty, addItem, onOpenChange]);

  const navigateImage = (dir: 'prev' | 'next') => {
    setSelectedImageIndex((prev) =>
      dir === 'prev'
        ? (prev - 1 + allImages.length) % allImages.length
        : (prev + 1) % allImages.length
    );
  };

  if (!product) return null;

  const productPrice = Number(product.price);
  const discPrice = getDiscountPrice(product);
  const hasDiscount = discPrice > 0 && discPrice < productPrice;
  const discountPercent = hasDiscount ? Math.round((1 - discPrice / productPrice) * 100) : 0;

  const content = (
    <div className="flex flex-col md:grid md:grid-cols-5 gap-0 max-h-[92vh] md:max-h-none overflow-hidden">
      {/* Image Gallery - 3 cols on desktop */}
      <div className="relative md:col-span-3 bg-muted/30">
        {/* Main Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={allImages[selectedImageIndex]}
            alt={`${product.name} ${selectedImageIndex + 1}`}
            className="w-full h-full object-cover transition-all duration-300"
          />

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => navigateImage('prev')}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </button>
              <button
                onClick={() => navigateImage('next')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-foreground" />
              </button>
            </>
          )}

          {/* Sale Badge */}
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
              {discountPercent}% Off
            </span>
          )}

          {/* Out of Stock Overlay */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[2px]">
              <span className="bg-destructive text-destructive-foreground text-sm font-bold px-5 py-2 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {allImages.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  idx === selectedImageIndex
                    ? 'border-primary ring-1 ring-primary/30 scale-105'
                    : 'border-border/50 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info - 2 cols on desktop */}
      <div className="md:col-span-2 p-5 md:p-6 flex flex-col overflow-y-auto md:max-h-[85vh]">
        {/* Category */}
        <span className="text-[11px] font-semibold text-primary uppercase tracking-[0.15em] mb-1">
          {product.category}
        </span>

        {/* Name */}
        <h2 className="text-lg md:text-xl font-bold text-foreground leading-tight mb-3">
          {product.name}
        </h2>

        {/* Description */}
        {product.description && (
          <div
            className="text-sm text-muted-foreground mb-4 line-clamp-4 prose prose-sm max-w-none [&_*]:m-0 [&_*]:p-0 overflow-hidden break-words [word-break:break-word] [&_pre]:whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: product.description.length > 200
                ? product.description.slice(0, 200) + '…'
                : product.description
            }}
          />
        )}

        {/* Price */}
        <div className="mb-4">
          {hasDiscount ? (
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-bold text-green-600">
                Rs. {discPrice.toFixed(0)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                Rs. {productPrice.toFixed(0)}
              </span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-foreground">
              Rs. {productPrice.toFixed(0)}
            </span>
          )}
        </div>

        {/* Stock & Sold Info */}
        <div className="flex items-center gap-3 mb-5">
          {product.stock > 0 ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-600">{product.stock} in stock</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-xs font-medium text-destructive">Out of Stock</span>
            </div>
          )}
          {product.sold !== undefined && product.sold > 0 && (
            <span className="text-[11px] font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              🔥 {product.sold} sold
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Quantity & Add to Cart */}
        {product.stock > 0 ? (
          <div className="space-y-3 sticky bottom-0 bg-background pt-2 -mx-5 md:-mx-6 px-5 md:px-6 pb-1">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Qty</span>
              <div className="flex items-center bg-muted/60 rounded-full p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 hover:bg-background"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-10 text-center font-bold text-sm">{qty}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 hover:bg-background"
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-full h-11 text-sm font-semibold"
                onClick={() => onOpenChange(false)}
              >
                Continue Shopping
              </Button>
              <Button
                className="flex-1 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 h-11 text-sm font-semibold shadow-md"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-1.5" />
                Add to Cart
              </Button>
            </div>
          </div>
        ) : (
          <Button
            className="w-full rounded-full h-12 text-sm font-semibold"
            variant="secondary"
            disabled
          >
            Out of Stock
          </Button>
        )}
      </div>
    </div>
  );

  // Mobile: use bottom drawer, Desktop: use dialog
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh] p-0">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[750px] w-[95vw] p-0 gap-0 overflow-hidden rounded-2xl">
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewDialog;

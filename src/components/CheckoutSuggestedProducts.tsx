import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
}

interface CheckoutSuggestedProductsProps {
  cartProductIds: string[];
  cartCategories?: string[];
}

const CheckoutSuggestedProducts = ({ cartProductIds, cartCategories = [] }: CheckoutSuggestedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchSuggested = async () => {
      setLoading(true);
      try {
        const cartIdSet = new Set(cartProductIds);
        const uniqueCategories = [...new Set(cartCategories)].filter(Boolean);

        let categoryMatches: Product[] = [];
        let otherProducts: Product[] = [];

        // Fetch all products from API
        const { data: productsData, error: productsError } = await api.getProducts();
        
        if (productsError) {
          console.error('CheckoutSuggestedProducts fetch error:', productsError);
          setProducts([]);
          return;
        }
        const allProducts: Product[] = (productsData || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price) || 0,
          image_url: p.image_urls?.[0],
          category: p.category,
        }));

        // Filter active products with stock
        const activeProducts = allProducts.filter((p) => p.price > 0);

        // 1. Fetch products from the same categories as cart items (smart recommendations)
        if (uniqueCategories.length > 0) {
          categoryMatches = activeProducts.filter(
            (p) => !cartIdSet.has(p.id) && uniqueCategories.includes(p.category)
          );
        }

        // 2. Fetch other products as fallback
        const categoryMatchIds = new Set(categoryMatches.map((p) => p.id));
        otherProducts = activeProducts.filter(
          (p) => !cartIdSet.has(p.id) && !categoryMatchIds.has(p.id)
        );

        // 3. Smart sort: category matches first, then others, shuffle within each group, take 4
        const shuffledCat = categoryMatches.sort(() => Math.random() - 0.5);
        const shuffledOther = otherProducts.sort(() => Math.random() - 0.5);
        const combined = [...shuffledCat, ...shuffledOther].slice(0, 4);

        setProducts(combined);
      } catch (err) {
        console.error('CheckoutSuggestedProducts fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggested();
  }, [cartProductIds.join(','), cartCategories.join(',')]);
  

  const handleAdd = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      stock: 999,
    });
    setAddedIds((prev) => new Set(prev).add(product.id));
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> You might also like
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-muted animate-pulse h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  const hasCategoryMatches = cartCategories.length > 0;
  
  // console.log('products',products);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8"
    >
      <h3 className="font-semibold text-base mb-1 flex items-center gap-2 ai-text-gradient">
        <Sparkles className="w-4 h-4 text-primary" /> You might also like
      </h3>
      {hasCategoryMatches && (
        <p className="text-[11px] text-muted-foreground mb-3">
          Based on items in your cart
        </p>
      )}
      {!hasCategoryMatches && <div className="mb-3" />}
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => {
          console.log('product',product);
          const isAdded = addedIds.has(product.id);
          const isCategoryMatch = cartCategories.includes(product.category);
          return (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.02 }}
              className="rounded-xl border border-border bg-card overflow-hidden flex flex-col ai-border-gradient ai-glow-hover"
            >
              <div className="relative">
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-20 object-cover"
                />
                <span className="absolute top-1.5 left-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm">
                  {product.category}
                </span>
                {isCategoryMatch && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                    Match
                  </span>
                )}
              </div>
              <div className="p-2.5 flex flex-col flex-1">
                <p className="text-xs font-medium text-foreground leading-tight line-clamp-2 flex-1 mb-2">
                  {product.name}
                </p>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-primary">Rs. {product.price.toFixed(0)}</span>
                  <Button
                    size="sm"
                    variant={isAdded ? 'secondary' : 'default'}
                    disabled={isAdded}
                    onClick={() => handleAdd(product)}
                    className="h-6 px-2 text-[11px] rounded-lg"
                  >
                    {isAdded ? (
                      '✓ Added'
                    ) : (
                      <>
                        <Plus className="w-3 h-3 mr-0.5" /> Add
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CheckoutSuggestedProducts;

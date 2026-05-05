import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye } from "lucide-react";
import QuickViewDialog from "./QuickViewDialog";
import { ScrollReveal, HoverScale } from "./animations";
import ProductFilters, { applyProductFilters, type SortOption, type StockFilter } from "./ProductFilters";

type Product = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  discount_price?: number | string | null;
  image_url: string | null;
  image_urls: string[];
  stock: number;
  category: string;
  is_active: boolean;
  created_at: string;
  sold?: number;
};

type Category = { id: string; name: string; is_active: boolean };

const CustomizeDeal = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(12);
  const [scrollToIndex, setScrollToIndex] = useState<number | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [stockFilter] = useState<StockFilter>('all');
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (scrollToIndex !== null) {
      const el = document.getElementById(`deal-item-${scrollToIndex}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      setScrollToIndex(null);
    }
  }, [scrollToIndex]);

  useEffect(() => {
    const load = async () => {
      const [{ data }, { data: catData }] = await Promise.all([
        api.getProducts(),
        api.getCategoriesList(),
      ]);
      if (data) setProducts(data);
      if (catData) setCategories([...catData.map((c: Category) => c)]);
    };
    load();
  }, []);

  const getDiscountPrice = (product: Product): number => {
    if (!product.discount_price) return 0;
    const price = Number(product.discount_price);
    return isNaN(price) || price <= 0 ? 0 : price;
  };

  const hasDiscount = (product: Product): boolean => {
    const disc = getDiscountPrice(product);
    const orig = Number(product.price);
    return disc > 0 && disc < orig;
  };

  const getEffectivePrice = (product: Product): number => {
    return hasDiscount(product) ? getDiscountPrice(product) : Number(product.price);
  };

  const getDiscountPercent = (product: Product): number => {
    const disc = getDiscountPrice(product);
    const orig = Number(product.price);
    return Math.round((1 - disc / orig) * 100);
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    addItem({
      id: product.id,
      name: product.name,
      price: Number(getEffectivePrice(product)),
      image: product.image_urls?.[0] || product.image_url || "",
      stock: product.stock,
    });
  };

  if (products.length === 0) return null;

  return (
    <section id="customize" className="py-16 bg-muted/30">
      <div className="container">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2 ai-text-gradient" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            The Perfect Gift is Here
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Browse our collection and add your favorites to cart.
            </p>
          </div>
        </ScrollReveal>

        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              className={`rounded-full ${activeCategory === cat ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground' : ''}`}
              onClick={() => { setActiveCategory(cat); setVisibleCount(12); }}
            >
              {cat}
            </Button>
          ))}
        </div>

        <ProductFilters
          sortBy={sortBy}
          onSortChange={(v) => { setSortBy(v); setVisibleCount(12); }}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {applyProductFilters(
            activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory),
            sortBy, stockFilter, getEffectivePrice
          ).slice(0, visibleCount).map((product, i) => {
            const effectivePrice = getEffectivePrice(product);
            const hasDiscountLocal = hasDiscount(product);

            return (
              <HoverScale key={product.id}>
                <motion.div
                  id={`deal-item-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className={`group/deal relative rounded-2xl border-2 overflow-hidden text-left transition-all duration-300 ai-border-gradient ai-glow-hover ${
                    product.stock <= 0
                      ? "border-border opacity-60"
                      : "border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
                  }`}
                >
                  {product.stock <= 0 && (
                    <div className="absolute top-2 left-2 z-10 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Out of Stock</div>
                  )}
                  {hasDiscountLocal && product.stock > 0 && (
                    <div className="absolute top-2 left-2 z-10 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {getDiscountPercent(product)}% OFF
                    </div>
                  )}

                  <div className="aspect-square overflow-hidden relative">
                    <img
                      src={product.image_urls?.[0] || product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className={`w-full h-full object-cover group-hover/deal:scale-105 transition-transform duration-500 ${product.stock <= 0 ? "opacity-50" : ""}`}
                      loading="lazy"
                    />
                    <button
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-100 md:opacity-0 md:group-hover/deal:opacity-100 md:scale-90 md:group-hover/deal:scale-100 transition-all duration-300 bg-background/90 backdrop-blur-sm text-foreground shadow-lg rounded-full p-1.5 md:px-3 md:py-1.5 text-xs font-semibold flex items-center gap-1 hover:bg-background border border-border/50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(product);
                        setQuickViewOpen(true);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5 md:h-3 md:w-3" />
                      <span className="hidden md:inline">Quick View</span>
                    </button>
                  </div>

                  <div className="p-3">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    {product.stock > 0 && product.stock <= 5 && (
                      <span className="text-xs font-bold text-destructive flex items-center gap-1">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-destructive"></span>
                        </span>
                        Only {product.stock} left
                      </span>
                    )}
                    {product.stock > 5 && product.stock <= 10 && (
                      <span className="text-xs font-bold text-destructive">Only {product.stock} left</span>
                    )}
                    {product.stock > 10 && (
                      <span className="text-xs text-muted-foreground">{product.stock} in stock</span>
                    )}
                    {hasDiscountLocal ? (
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-bold text-green-600">Rs. {getDiscountPrice(product).toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground line-through">Rs. {Number(product.price).toFixed(0)}</p>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-primary">Rs. {Number(product.price).toFixed(0)}</p>
                    )}

                    <Button
                      size="sm"
                      className="w-full mt-2 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                      disabled={product.stock <= 0}
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </motion.div>
              </HoverScale>
            );
          })}
        </div>

        {visibleCount < products.length && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" size="lg" className="rounded-full px-8" onClick={() => { const prev = visibleCount; setVisibleCount((p) => p + 16); setScrollToIndex(prev); }}>
              Load More Products
            </Button>
          </div>
        )}
      </div>

      <QuickViewDialog product={quickViewProduct} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
    </section>
  );
};

export default CustomizeDeal;

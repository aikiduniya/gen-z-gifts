import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';
import { ShoppingCart, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import QuickViewDialog from './QuickViewDialog';
import { ScrollReveal, HoverScale } from './animations';


type Product = {
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
};

type Category = {
  id: string;
  name: string;
  is_active: boolean;
};

const GiftGrid = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getDiscountPrice = (gift: Product): number => {
    if (!gift.discount_price) return 0;
    const price = Number(gift.discount_price);
    return isNaN(price) || price <= 0 ? 0 : price;
  };

  const getProductPrice = (gift: Product): number => Number(gift.price);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: prodData }, { data: catData }] = await Promise.all([
          api.getProducts(),
          api.getCategoriesList(),
        ]);
        if (prodData) setProducts(prodData);
        if (catData) setCategories([...catData.map((c: Category) => c)]);
      } catch (e) {
        console.error('Failed to load products', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory);

  // Auto-scroll
  const scrollRef2 = useRef<number | null>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || filtered.length === 0) return;
    const speed = 1; // px per frame
    const step = () => {
      if (!el) return;
      el.scrollLeft += speed;
      // loop back when reaching the end
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
        el.scrollLeft = 0;
      }
      scrollRef2.current = requestAnimationFrame(step);
    };
    scrollRef2.current = requestAnimationFrame(step);
    const pause = () => { if (scrollRef2.current) cancelAnimationFrame(scrollRef2.current); };
    const resume = () => { scrollRef2.current = requestAnimationFrame(step); };
    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('touchstart', pause);
    el.addEventListener('touchend', resume);
    return () => {
      if (scrollRef2.current) cancelAnimationFrame(scrollRef2.current);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('touchend', resume);
    };
  }, [filtered.length]);

  if (!loading && products.length === 0) return null;

  return (
    <section id="shop" className="py-16">
      <div className="container">
        <ScrollReveal>
          <h2 className="text-3xl font-bold text-center mb-2 ai-text-gradient" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Trending Gifts
          </h2>
          <p className="text-center text-muted-foreground mb-8">Find the perfect gift for anyone</p>
        </ScrollReveal>

        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              className={`rounded-full ${activeCategory === cat ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>


        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden min-w-[280px] flex-shrink-0">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-3/4" />
                  <div className="flex items-center justify-between mt-3">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* Scrollable Container */}
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filtered.map((gift, i) => (
                <motion.div
                  key={gift.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="group min-w-[260px] sm:min-w-[280px] max-w-[300px] flex-shrink-0"
                >
                  <HoverScale>
                    <div className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group/card relative h-full flex flex-col ai-border-gradient ai-glow-hover">
                      <Link to={`/gift/${gift.slug || gift.id}`}>
                        <div className="aspect-square overflow-hidden relative">
                          <img
                            src={gift.image_urls?.[0] || '/placeholder.svg'}
                            alt={gift.name}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${gift.stock <= 0 ? 'opacity-50' : ''}`}
                            loading="lazy"
                          />
                          {gift.stock <= 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                              <span className="bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
                            </div>
                          )}
                          {(() => {
                            const discPrice = getDiscountPrice(gift);
                            const productPrice = getProductPrice(gift);
                            const hasDiscount = discPrice > 0 && discPrice < productPrice;
                            if (hasDiscount) {
                              const percentOff = Math.round((1 - discPrice / productPrice) * 100);
                              return (
                                <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  {percentOff}% OFF
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </Link>

                      {/* Quick View Button */}
                      <button
                        className="absolute bottom-[calc(50%+2rem)] left-1/2 -translate-x-1/2 z-10 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 md:translate-y-2 md:group-hover/card:translate-y-0 transition-all duration-300 bg-background/90 backdrop-blur-sm text-foreground shadow-lg rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 hover:bg-background border ai-glow-hover border-border/50"
                        onClick={() => {
                          setQuickViewProduct(gift);
                          setQuickViewOpen(true);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                        Quick View
                      </button>

                      <div className="p-4 flex flex-col flex-1">
                        <span className="text-xs font-medium text-primary/70 uppercase tracking-wider">{gift.category}</span>
                        <Link to={`/gift/${gift.slug || gift.id}`}>
                          <h3 className="font-semibold mt-1 text-foreground hover:text-primary transition-colors line-clamp-2 min-h-[2.75rem]">{gift.name}</h3>
                        </Link>
                        {gift.stock > 0 && gift.stock <= 5 && (
                          <span className="text-xs font-bold text-destructive mt-1 flex items-center gap-1">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-destructive"></span>
                            </span>
                            Only {gift.stock} left
                          </span>
                        )}
                        {gift.stock > 5 && gift.stock <= 10 && (
                          <span className="text-xs font-bold text-destructive mt-1">Only {gift.stock} left</span>
                        )}
                        {gift.stock > 10 && (
                          <span className="text-xs text-muted-foreground mt-1">{gift.stock} in stock</span>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-3">
                          {(() => {
                            const discPrice = getDiscountPrice(gift);
                            const productPrice = getProductPrice(gift);
                            const hasDiscount = discPrice > 0 && discPrice < productPrice;
                            return hasDiscount ? (
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-green-600">Rs. {discPrice.toFixed(0)}</span>
                                <span className="text-sm text-muted-foreground line-through">Rs. {productPrice.toFixed(0)}</span>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-foreground">Rs. {productPrice.toFixed(0)}</span>
                            );
                          })()}

                          {gift.stock > 0 ? (
                            <Button
                              size="sm"
                              className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                              onClick={() => {
                                const discPrice = getDiscountPrice(gift);
                                const productPrice = getProductPrice(gift);
                                const cartPrice = discPrice > 0 && discPrice < productPrice ? discPrice : productPrice;
                                addItem({
                                  id: gift.id,
                                  name: gift.name,
                                  price: Number(cartPrice),
                                  image: gift.image_urls?.[0] || '',
                                  stock: gift.stock,
                                });
                              }}
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          ) : (
                            <span className="text-xs font-semibold text-destructive bg-destructive/10 px-3 py-1.5 rounded-full">Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </HoverScale>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick View Dialog */}
      <QuickViewDialog
        product={quickViewProduct}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </section>
  );
};

export default GiftGrid;

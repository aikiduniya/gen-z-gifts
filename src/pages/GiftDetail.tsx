import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import SEO from '@/components/SEO';
import { useCartStore } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft, Minus, Plus, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Eye } from 'lucide-react';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import ImageMagnifier from '@/components/ImageMagnifier';



interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number | string | null;
  image_url: string;
  image_urls: string[];
  category: string;
  stock: number;
  is_active: boolean;
  slug?: string;
  sold?: number;
}

interface Review {
  id: string;
  order_id: string;
  order_number: string;
  product_id: number;
  product_name: string;
  product_image: string;
  customer_email: string;
  rating: number;
  review_text: string;
  created_at: string;
}

const GiftDetail = () => {
  const { slug } = useParams();
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [gift, setGift] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | undefined>(undefined);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const reviewsRef = useRef<HTMLDivElement>(null);
  
  // Simulated live viewer count
  const baseViewers = useMemo(() => Math.floor(Math.random() * 15) + 3, [slug]);
  const [viewers, setViewers] = useState(baseViewers);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(2, Math.min(prev + change, baseViewers + 10));
      });
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [baseViewers]);

  useEffect(() => {
    // Scroll to top when component mounts or slug changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const productResponse = await api.getProductBySlug(slug!);
      if (productResponse.error || !productResponse.data) {
        setError(productResponse.error || 'Product not found');
        setLoading(false);
        return;
      }
      const product = productResponse.data;
      setGift(product);

      // Fetch related products from same category
      const productsResponse = await api.getProducts();
      if (productsResponse.error) {
        setRelated([]);
      } else {
        const relatedData = productsResponse.data?.filter(p => p.is_active && p.category === product.category && p.id !== product.id && p.stock > 0).slice(0, 4) || [];
        setRelated(relatedData);
      }

      // Fetch product reviews
      setReviewsLoading(true);
      const reviewsResponse = await api.getProductReviews(product.id);
      if (!reviewsResponse.error && reviewsResponse.data) {
        setReviews(reviewsResponse.data.reviews || []);
        setReviewCount(reviewsResponse.data.reviewCount || 0);
        setAverageRating(reviewsResponse.data.averageRating || 0);
      }
      setReviewsLoading(false);

      setLoading(false);
    };

    load();
  }, [slug]);

  useEffect(() => {
    if (!carouselApi) return;
    
    const updateSelectedIndex = () => {
      setSelectedIndex(carouselApi.selectedScrollSnap());
    };
    
    carouselApi.on('select', updateSelectedIndex);
    updateSelectedIndex();
    
    return () => {
      carouselApi.off('select', updateSelectedIndex);
    };
  }, [carouselApi]);

  const scrollTo = (index: number) => {
    carouselApi?.scrollTo(index);
  };

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Safe discount helpers
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Mask email for privacy
  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = local.charAt(0) + '***' + (local.length > 1 ? local.charAt(local.length - 1) : '');
    return `${maskedLocal}@${domain}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <CartDrawer />
        <main className="flex-1 overflow-visible">
          <div className="container px-4 py-6">
            <Skeleton className="h-4 w-32 mb-6" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="w-16 h-16 rounded-lg flex-shrink-0" />
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-11 w-40 rounded-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-destructive">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link to="/"><Button>Back to Shop</Button></Link>
        </div>
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Gift not found</h1>
          <Link to="/"><Button>Back to Shop</Button></Link>
        </div>
      </div>
    );
  }

  // Get all images - prioritize image_urls array, fallback to single image_url
  const allImages = gift.image_urls && gift.image_urls.length > 0 
    ? gift.image_urls 
    : ['/placeholder.svg'];

  // Calculate SEO price
  const seoPrice = getEffectivePrice(gift);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`${gift.name} - Buy Online | GenZGifts`}
        description={`Buy ${gift.name} for Rs. ${Number(seoPrice).toFixed(0)} at GenZGifts Pakistan. ${gift.category} gifts with fast delivery.`}
        canonical={`https://genzgifts.com/gift/${slug}`}
        ogImage={allImages[0]}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": gift.name,
          "image": allImages,
          "description": gift.description?.replace(/<[^>]*>/g, '').slice(0, 200),
          "offers": { "@type": "Offer", "price": seoPrice, "priceCurrency": "PKR", "availability": gift.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" }
        }}
      />
      <Header />
      <CartDrawer />
      <main className="flex-1 overflow-visible">
        <div className="px-3 sm:px-6 py-3 sm:py-6 max-w-5xl mx-auto overflow-x-hidden">
          <Link to="/" className="inline-flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-2 sm:mb-5">
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Back to Shop
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
            {/* Image Section */}
            <div className="space-y-2">
              <div className="rounded-xl overflow-hidden border border-border relative ai-glow-hover">
                <Carousel 
                  setApi={setCarouselApi} 
                  className="w-full"
                  opts={{ loop: true }}
                >
                  <CarouselContent>
                    {allImages.map((img, index) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-[4/3] sm:aspect-square bg-muted">
                          <ImageMagnifier src={img} alt={`${gift.name} ${index + 1}`} className="w-full h-full" />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  
                  {allImages.length > 1 && (
                    <>
                      <Button variant="outline" size="icon" className="absolute left-1.5 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-background/80 backdrop-blur-sm border-0 shadow-lg" onClick={() => carouselApi?.scrollPrev()}>
                        <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-background/80 backdrop-blur-sm border-0 shadow-lg" onClick={() => carouselApi?.scrollNext()}>
                        <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </>
                  )}
                </Carousel>

                {allImages.length > 1 && (
                  <div className="absolute bottom-2 left-2 bg-background/70 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium">
                    {selectedIndex + 1}/{allImages.length}
                  </div>
                )}

                {/* Sale Badge */}
                {hasDiscount(gift) && (
                  <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {getDiscountPercent(gift)}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => scrollTo(index)}
                      className={`relative flex-shrink-0 w-11 h-11 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-md overflow-hidden border-2 transition-all ${
                        selectedIndex === index 
                          ? 'border-primary ring-1 ring-primary/30' 
                          : 'border-border/60'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col pt-0 md:pt-2">
              <span className="text-[10px] sm:text-xs font-semibold text-primary/80 uppercase tracking-widest">{gift.category}</span>
              
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span className="font-medium text-foreground">{viewers}</span> people viewing this now
                </span>
              </div>
              <h1 className="text-base sm:text-xl md:text-2xl font-bold mt-1 mb-1.5 sm:mb-3 leading-tight ai-text-gradient">{gift.name}</h1>
              <div
                className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4 leading-relaxed prose prose-sm max-w-none overflow-hidden overflow-x-hidden break-words [word-break:break-word] [overflow-wrap:anywhere] [&_*]:max-w-full [&_*]:overflow-hidden [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:font-bold [&_em]:italic [&_p]:mb-1 [&_img]:max-w-full [&_pre]:whitespace-pre-wrap [&_table]:table-fixed [&_table]:w-full"
                dangerouslySetInnerHTML={{ __html: gift.description }}
              />
              
              {/* Reviews Summary */}
              {(reviewCount > 0 || reviewsLoading) && (
                <button 
                  onClick={scrollToReviews}
                  className="flex items-center gap-1.5 mb-3 text-sm hover:underline w-fit"
                >
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= Math.round(averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-muted text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-foreground">
                    {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                  </span>
                  <span className="text-muted-foreground">
                    ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
                  </span>
                </button>
              )}

              {/* Price Display */}
              {hasDiscount(gift) ? (
                <div className="flex items-center gap-3 mb-2.5 sm:mb-5">
                  <span className="text-lg sm:text-2xl md:text-3xl font-bold text-green-600">Rs. {getDiscountPrice(gift).toFixed(0)}</span>
                  <span className="text-sm sm:text-lg md:text-xl text-muted-foreground line-through">Rs. {Number(gift.price).toFixed(0)}</span>
                  <span className="text-xs font-semibold text-green-600 bg-green-600/10 px-2 py-1 rounded-full">
                    {getDiscountPercent(gift)}% OFF
                  </span>
                </div>
              ) : (
                <p className="text-lg sm:text-2xl md:text-3xl font-bold mb-2.5 sm:mb-5">Rs. {Number(gift.price).toFixed(0)}</p>
              )}

              {gift.stock > 0 ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center border border-border rounded-full">
                    <Button variant="ghost" size="icon" className="rounded-full h-7 w-7 sm:h-9 sm:w-9" onClick={() => setQty(Math.max(1, qty - 1))}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 sm:w-8 text-center font-semibold text-xs sm:text-sm">{qty}</span>
                    <Button variant="ghost" size="icon" className="rounded-full h-7 w-7 sm:h-9 sm:w-9" onClick={() => setQty(Math.min(gift.stock, qty + 1))}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  {gift.stock <= 5 ? (
                    <span className="text-[10px] sm:text-xs font-semibold text-destructive flex items-center gap-1">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-destructive"></span>
                      </span>
                      Only {gift.stock} left — hurry!
                    </span>
                  ) : gift.stock <= 10 ? (
                    <span className="text-[10px] sm:text-xs font-semibold text-destructive">Only {gift.stock} left!</span>
                  ) : (
                    <span className="text-[10px] sm:text-xs text-muted-foreground">{gift.stock} in stock</span>
                  )}
                  {gift.sold !== undefined && gift.sold > 0 && (
                    <span className="text-[10px] sm:text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>🔥</span>
                      <span>{gift.sold} sold</span>
                    </span>
                  )}
                  
                  <Button
                    className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 w-full h-9 sm:h-11 text-xs sm:text-sm mt-1.5 sm:mt-0 ai-glow-hover"
                    onClick={() => {
                      const effectivePrice = getEffectivePrice(gift);
                      for (let i = 0; i < qty; i++) {
                        addItem({ id: gift.id, name: gift.name, price: Number(effectivePrice), image: gift.image_urls?.[0] || '', stock: gift.stock });
                      }
                    }}
                  >
                    <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" /> Add to Cart
                  </Button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive font-semibold px-3 py-1.5 rounded-full text-xs sm:text-sm w-fit">
                  Out of Stock
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div ref={reviewsRef} className="mt-6 sm:mt-14">
            <h2 className="text-sm sm:text-xl font-bold mb-2.5 sm:mb-5 ai-text-gradient">Customer Reviews</h2>
            
            {reviewsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 border border-border rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 border border-border rounded-xl ai-border-gradient ai-glow-hover">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {review.customer_email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{maskEmail(review.customer_email)}</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-muted text-muted'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {review.review_text && (
                      <p className="text-sm text-muted-foreground">{review.review_text}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-border rounded-xl">
                <Star className="h-8 w-8 mx-auto text-muted mb-2" />
                <p className="text-muted-foreground">No reviews yet</p>
                <p className="text-sm text-muted-foreground">Be the first to review this product!</p>
              </div>
            )}
          </div>

          {/* Related Products */}
  {related.length > 0 && (
            <div className="mt-6 sm:mt-14">
              <h2 className="text-sm sm:text-xl font-bold mb-2.5 sm:mb-5 ai-text-gradient">You Might Also Like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                {related.map((r) => (
                   <Link key={r.id} to={`/gift/${r.slug || r.id}`} className="group rounded-lg sm:rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all ai-border-gradient ai-glow-hover">
                    <div className="aspect-square overflow-hidden">
                      <img src={r.image_urls?.[0] || '/placeholder.svg'} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <div className="p-1.5 sm:p-3">
                      <h3 className="text-[11px] sm:text-sm font-medium truncate">{r.name}</h3>
                      {hasDiscount(r) ? (
                        <div className="flex items-center gap-1">
                          <p className="text-[11px] sm:text-sm font-bold text-green-600">Rs. {getDiscountPrice(r).toFixed(0)}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground line-through">Rs. {Number(r.price).toFixed(0)}</p>
                        </div>
                      ) : (
                        <p className="text-[11px] sm:text-sm font-bold text-primary">Rs. {Number(r.price).toFixed(0)}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GiftDetail;

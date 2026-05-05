import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Star, ShoppingBag, ArrowLeft } from 'lucide-react';


interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

const Review = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const productId = searchParams.get('product');

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getProducts();
        if (res.data) {
          const foundProduct = res.data.find((p: Product) => p.id === parseInt(productId));
          if (foundProduct) {
            setProduct(foundProduct);
          }
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber || !productId || !email || rating === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.createReview({
        order_number: orderNumber,
        product_id: parseInt(productId),
        customer_email: email,
        rating,
        review_text: reviewText,
      });

      if (res.data) {
        toast.success('Thank you for your review!');
        setSubmitted(true);
      } else {
        toast.error(res.error || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!productId || !orderNumber) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Review Link</h1>
            <p className="text-muted-foreground mb-6">This review link is invalid or expired.</p>
            <Link to="/">
              <Button>Back to Shop</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">The product for this review could not be found.</p>
            <Link to="/">
              <Button>Back to Shop</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 fill-green-500 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Thank You!
            </h1>
            <p className="text-muted-foreground mb-6">
              Your review for {product.name} has been submitted successfully.
            </p>
            <Link to="/">
              <Button className="rounded-full">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container max-w-2xl">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>

          <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Write a Review
            </h1>
            <p className="text-muted-foreground mb-6">
              Share your experience with this product
            </p>

            {/* Product Info */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl mb-6">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0">
                <img 
                  src={product.image_url || '/placeholder.svg'} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">Order: #{orderNumber}</p>
                <p className="text-sm font-medium text-primary">Rs. {Number(product.price).toFixed(0)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              {/* Rating */}
              <div>
                <Label>Rating <span className="text-destructive">*</span></Label>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-muted text-muted'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select a rating'}
                  </span>
                </div>
              </div>

              {/* Suggested Reviews */}
              <div>
                <Label>Suggested Reviews (Click to use)</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {[
                    "Absolutely love this product! The quality exceeded my expectations and delivery was super fast. Highly recommend to everyone!",
                    "Great value for money! It's exactly as described and works perfectly. Will definitely order again.",
                    "Really impressed with the quality and design. Customer service was excellent too. Five stars!",
                    "Amazing product! It arrived in perfect condition and looks even better in person. Very happy with my purchase!",
                    "Best purchase I've made recently. The quality is outstanding and the price is very reasonable. Totally worth it!"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setReviewText(suggestion)}
                      className={`text-left p-3 rounded-lg border transition-all hover:border-primary hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground ${
                        reviewText === suggestion ? 'border-primary bg-primary/10 text-foreground' : 'border-border'
                      }`}
                    >
                      "{suggestion}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <Label htmlFor="review">Your Review (Optional)</Label>
                <Textarea
                  id="review"
                  placeholder="Tell us what you liked or didn't like about this product..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={submitting || rating === 0 || !email}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Review;

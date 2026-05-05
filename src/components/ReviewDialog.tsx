import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Star } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReviewDialog = ({ open, onOpenChange }: ReviewDialogProps) => {
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
    const fetchData = async () => {
      if (!productId || !orderNumber) {
        setLoading(false);
        return;
      }

      try {
        // Fetch product and order in parallel
        const [productRes, orderRes] = await Promise.all([
          api.getProducts(),
          api.getOrder(orderNumber)
        ]);

        // Set product
        if (productRes.data) {
          const foundProduct = productRes.data.find((p: Product) => p.id === parseInt(productId));
          if (foundProduct) {
            setProduct(foundProduct);
          }
        }

        // Set email from order
        if (orderRes.data && orderRes.data.length > 0) {
          const order = orderRes.data[0];
          if (order.customer_email) {
            setEmail(order.customer_email);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [productId, orderNumber, open]);

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
        // Close dialog after success
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      } else {
        toast.error(res.error || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form state
    setSubmitted(false);
    setRating(0);
    setReviewText('');
    setEmail('');
  };

  // Don't render if no productId or orderNumber
  if (!productId || !orderNumber) {
    return null;
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (submitted || !product) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Thank You!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 fill-green-500 text-green-500" />
            </div>
            <p className="text-muted-foreground">
              Your review has been submitted successfully.
            </p>
          </div>
          <Button onClick={handleClose} className="w-full rounded-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const suggestedReviews = [
    "Love it! Great quality and fast delivery. Highly recommend!",
    "Great value for money. Exactly as described. Will order again!",
    "Really impressed with quality and design. Five stars!",
    "Amazing product! Arrived in perfect condition. Very happy!",
    "Best purchase! Outstanding quality and reasonable price."
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Write a Review
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl mb-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div hidden>
            <Label htmlFor="popup-email">Email</Label>
            <Input
              id="popup-email"
              type="email"
              value={email}
              readOnly
              className="mt-1 bg-muted/50"
            />
          </div>

          {/* Suggested Reviews */}
          <div className="relative z-0">
            <Label>Suggested Reviews</Label>
            <Select
              value={reviewText}
              onValueChange={(value) => setReviewText(value)}
            >
              <SelectTrigger className="mt-1 z-0 w-full">
                <SelectValue placeholder="Select a suggested review or write your own" />
              </SelectTrigger>
              <SelectContent className="z-[100]" sideOffset={0}>
                {suggestedReviews.map((suggestion, index) => (
                  <SelectItem 
                    key={index} 
                    value={suggestion}
                    className="whitespace-normal break-words leading-relaxed py-3"
                  >
                    {suggestion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Review Text */}
          <div>
            <Label htmlFor="popup-review">Your Review (Optional)</Label>
            <Textarea
              id="popup-review"
              placeholder="Tell us what you liked or didn't like..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
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
                  className="p-0.5 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-muted text-muted'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select'}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-full"
            disabled={submitting || rating === 0}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;

import { useState } from 'react';
import SEO from '@/components/SEO';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Search, Loader2, CheckCircle, Clock, Truck, MapPin, Tag } from 'lucide-react';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';


interface TrackedOrder {
  order_number: string;
  customer_name: string;
  status: string;
  shipping_city: string;
  shipping_country: string;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  coupon_code: string | null;
  total: number;
  created_at: string;
  updated_at: string;
  items: { product_name: string; price: number; quantity: number }[];
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
];

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    const res = await api.trackOrder(orderNumber.trim());
    if (res.error) {
      setError(res.error === 'Order not found' ? 'No order found with this number. Please check and try again.' : res.error);
    } else if (res.data) {
      setOrder(res.data);
    }
    setLoading(false);
  };

  // Auto-track if order number in URL
  useState(() => {
    if (orderNumber) handleTrack();
  });

  const getStatusIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    const idx = statusSteps.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const currentStep = order ? getStatusIndex(order.status) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Track Your Order | GenZGifts" description="Track your GenZGifts order status in real-time. Enter your order number to see shipping updates and delivery status." canonical="https://genzgifts.com/track-order" />
      <Header />
      <CartDrawer />
      <main className="flex-1 py-8 sm:py-12">
        <div className="container max-w-2xl px-4">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Package className="h-10 w-10 text-primary mx-auto mb-3" />
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Track Your Order
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your order number to see the latest status</p>
          </motion.div>

          <form onSubmit={handleTrack} className="flex gap-2 mb-8">
            <Input
              placeholder="e.g. ORD-1234567890"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading} className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>

          {error && (
            <div className="text-center p-6 rounded-xl border border-destructive/30 bg-destructive/5">
              <p className="text-destructive font-medium">{error}</p>
            </div>
          )}

          {order && (
            <div className="space-y-6 animate-in fade-in-50">
              {/* Status Timeline */}
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-semibold text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Order #{order.order_number}</h2>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                    order.status === 'delivered' ? 'bg-green-500/10 text-green-600' :
                    order.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                    order.status === 'shipped' ? 'bg-blue-500/10 text-blue-600' :
                    'bg-primary/10 text-primary'
                  }`}>{order.status}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-5">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>

                {order.status !== 'cancelled' ? (
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
                    <div className="absolute top-4 left-0 h-0.5 bg-primary transition-all" style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }} />
                    {statusSteps.map((step, i) => {
                      const Icon = step.icon;
                      const isActive = i <= currentStep;
                      return (
                        <div key={step.key} className="flex flex-col items-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                            isActive ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-border text-muted-foreground'
                          }`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className={`text-[10px] sm:text-xs mt-1.5 font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-destructive font-medium">This order has been cancelled.</p>
                )}
              </div>

              {/* Order Items */}
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <h2 className="font-semibold text-sm mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Items</h2>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.product_name} × {item.quantity}</span>
                      <span className="font-medium">Rs. {(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-3 pt-3 space-y-1">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span>{order.shipping_cost === 0 ? 'Free' : `Rs. ${order.shipping_cost}`}</span>
                  </div>
                  {order.coupon_code && order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Discount ({order.coupon_code})
                      </span>
                      <span>-Rs. {Number(order.discount_amount).toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>Rs. {Number(order.total).toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <h2 className="font-semibold text-sm mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Shipping To</h2>
                <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                <p className="text-sm text-muted-foreground">{order.shipping_city}, {order.shipping_country}</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrder;

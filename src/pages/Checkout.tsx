import { useState } from 'react';
import SEO from '@/components/SEO';
import { useCartStore } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import { ArrowLeft, Lock, Loader2, Truck, CreditCard, Banknote, Tag, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/sonner';
import CheckoutSuggestedProducts from '@/components/CheckoutSuggestedProducts';
import PaymentAccountDetails from '@/components/PaymentAccountDetails';
import { motion } from 'framer-motion';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe' | 'advance'>('cod');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', zip: '', country: 'Pakistan',
  });
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const shippingCost = paymentMethod === 'advance' ? 0 : (totalPrice() >= 5000 ? 0 : 99);
  
  // Calculate discount
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = totalPrice();
    if (appliedCoupon.discountType === 'percentage') {
      return (subtotal * appliedCoupon.discount) / 100;
    }
    return appliedCoupon.discount;
  };
  
  const discount = calculateDiscount();
  const grandTotal = totalPrice() + shippingCost - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    
    setCouponLoading(true);
    try {
      const response = await api.validateCoupon(couponCode.trim().toUpperCase(), totalPrice());
      if (response.error) {
        toast.error(response.error);
        return;
      }
      
if (response.data) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discount: response.data.discountAmount || response.data.discount_value,
          discountType: response.data.discount_type,
        });
        toast.success('Coupon applied successfully!');
      }
    } catch (err: any) {
      toast.error('Failed to apply coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate stock before submitting order
    try {
      const productIds = items.map((i) => i.id);
      const { data: products } = await api.getProducts();
      if (!products) throw new Error('Unable to fetch product information.');

      // Get undelivered orders to calculate reserved stock
      const { data: orders } = await api.getOrders();
      if (!orders) throw new Error('Unable to fetch order information.');

      const { data: orderItems } = await api.getOrderItems();
      if (!orderItems) throw new Error('Unable to fetch order items information.');

      const undeliveredOrderIds = new Set((orders as any[]).filter((o: any) => o.status !== 'delivered').map((o: any) => o.id));
      const reservedQuantities = new Map<string, number>();
      (orderItems as any[]).filter((oi: any) => undeliveredOrderIds.has(oi.order_id)).forEach((oi: any) => {
        reservedQuantities.set(oi.product_id, (reservedQuantities.get(oi.product_id) || 0) + (oi.quantity as number));
      });

      const stockMap = new Map<string, number>(products.map((p: any) => [p.id, Number(p.stock)]));
      for (const item of items) {
        const currentStock = stockMap.get(item.id) || 0;
        const reservedQty = reservedQuantities.get(item.id) || 0;
        const availableStock = currentStock - reservedQty;
        if (availableStock <= 0) {
          toast.error(`Product ${item.name} is out of stock. Please remove it from your cart.`);
          setLoading(false);
          return;
        }
        if (availableStock < item.quantity) {
          toast.error(`Insufficient stock for ${item.name}. Only ${availableStock} available. Please update your cart.`);
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      toast.error('Unable to validate stock. Please try again.');
      setLoading(false);
      return;
    }

    if (paymentMethod === 'cod' || paymentMethod === 'advance') {
      try {
        const orderData = {
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          shipping_address: form.address,
          shipping_city: form.city,
          shipping_zip: form.zip,
          shipping_country: form.country,
          items: items.map((i) => ({
            product_id: i.id,
            product_name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
          payment_screenshot: screenshotUrl || '',
          coupon_code: appliedCoupon?.code || null,
          discount_amount: discount,
        };
        const response = await api.createOrder(orderData);
        if (response.error) throw new Error(response.error);

        clearCart();
        const orderNumber = response.data?.orderNumber;
        if (paymentMethod === 'advance') {
          navigate(`/order-confirmation/${orderNumber}?payment=advance`);
        } else {
          navigate(`/order-confirmation/${orderNumber}`);
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Order failed. Please try again.';
        if (errorMessage.includes('foreign key constraint') || errorMessage.includes('Cannot add or update a child row')) {
          toast.error('Some products in your cart are no longer available. Please update your cart and try again.');
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const response = await api.createCheckout({
          items: items.map((i) => ({ 
            product_id: i.id, 
            name: i.name, 
            price: i.price, 
            quantity: i.quantity, 
            image: i.image 
          })),
          customerEmail: form.email,
          customerName: form.name,
          customerPhone: form.phone,
          shippingAddress: form.address,
          shippingCity: form.city,
          shippingZip: form.zip,
          shippingCountry: form.country,
          shippingCost,
        });
        if (response.error) throw new Error(response.error);
        if (response.data?.url) {
          clearCart();
          // Store order number for confirmation page
          if (response.data.orderNumber) {
            localStorage.setItem('lastOrderNumber', response.data.orderNumber);
          }
          window.location.href = response.data.url;
        }
      } catch (err: any) {
        toast.error(err.message || 'Payment failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <CartDrawer />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <Link to="/"><Button>Continue Shopping</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Checkout | GenZGifts" description="Complete your order at GenZGifts. Secure checkout with COD and advance payment options. Free shipping on orders over Rs. 5000." canonical="https://genzgifts.com/checkout" />
      <Header />
      <CartDrawer />
      <main className="flex-1">
        <div className="container py-8 max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>

          <motion.h1 
            className="text-3xl font-bold mb-8" 
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            Checkout
          </motion.h1>

          <div className="grid md:grid-cols-5 gap-8">
            <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
              <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Shipping Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input id="zip" required value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
                </div>
              </div>

              <h2 className="text-lg font-semibold mt-6 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Payment Method</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <Truck className="h-5 w-5 text-primary" />
                  <div className="text-center">
                    <p className="font-semibold text-sm">COD</p>
                    <p className="text-xs text-muted-foreground">Pay on delivery</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('advance')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'advance'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <Banknote className="h-5 w-5 text-primary" />
                  <div className="text-center">
                    <p className="font-semibold text-sm">Advance</p>
                    <p className="text-xs text-muted-foreground">Free shipping</p>
                  </div>
                </button>
              </div>
              {paymentMethod === 'advance' && (
                <div className="mt-3 space-y-3">
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Free shipping on advance payment!</p>
                    <p>Send payment to any account below, then upload the screenshot.</p>
                  </div>
                  <PaymentAccountDetails
                    onScreenshotUploaded={setScreenshotUrl}
                    screenshotUrl={screenshotUrl}
                  />
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full mt-6 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : paymentMethod === 'cod' ? <Truck className="h-4 w-4 mr-2" /> : paymentMethod === 'advance' ? <Banknote className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : paymentMethod === 'advance' ? 'Place Order (Advance)' : 'Pay with Stripe'}
              </Button>
              {paymentMethod === 'stripe' && <p className="text-xs text-center text-muted-foreground">Secured by Stripe</p>}
            </form>

            <div className="md:col-span-2">
              <div className="rounded-2xl border border-border bg-card p-6 sticky top-24">
                <h2 className="font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Order Summary</h2>
                
                {/* Coupon Code Section */}
                <div className="mb-4 p-3 rounded-lg bg-muted/50">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">{appliedCoupon.code}</span>
                        </div>
                        <span className="text-xs text-green-600">
                          {appliedCoupon.discountType === 'percentage' 
                            ? `${appliedCoupon.discount}% off` 
                            : `Flat Rs. ${appliedCoupon.discount} off`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        size="sm"
                        variant="secondary"
                      >
                        {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate mr-2">{item.name} x {item.quantity}</span>
                      <span className="font-medium">Rs. {(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : `Rs. ${shippingCost}`}</span>
                  </div>
                  {appliedCoupon && discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 mb-1">
                      <span>
                        Discount
                        {appliedCoupon.discountType === 'percentage' 
                          ? ` (${appliedCoupon.discount}% off)`
                          : ` (Flat Rs. ${appliedCoupon.discount} off)`}
                      </span>
                      <span>-Rs. {discount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>Rs. {grandTotal.toFixed(0)}</span>
                  </div>
                </div>

                <CheckoutSuggestedProducts
                  cartProductIds={items.map((i) => i.id)}
                  cartCategories={items.map((i) => (i as any).category).filter(Boolean)}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;

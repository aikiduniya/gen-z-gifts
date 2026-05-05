import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PaymentAccountDetails from '@/components/PaymentAccountDetails';
import SEO from '@/components/SEO';
import { motion } from 'framer-motion';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const isAdvance = searchParams.get('payment') === 'advance';

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Order Confirmed | GenZGifts" description="Your order has been placed successfully. Thank you for shopping with GenZGifts!" />
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <motion.div 
          className="text-center max-w-lg mx-auto px-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Order Confirmed! 🎉</h1>
          <p className="text-muted-foreground mb-2">Thank you for your purchase!</p>
          <p className="text-sm text-muted-foreground mb-6">
            Order Number: <span className="font-mono font-bold text-foreground">{orderId}</span>
          </p>

          {/* {isAdvance ? (
            <div className="text-left mb-8 rounded-xl border border-accent/30 bg-accent/5 p-5">
              <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                💳 Send Payment to Complete Your Order
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Transfer the amount to any account below. Share the screenshot on WhatsApp or email for faster confirmation.
              </p>
              <PaymentAccountDetails showUpload={false} />
            </div>
          ) : ( */}
            <p className="text-sm text-muted-foreground mb-8">
              We'll send you an email with your order details and tracking information.
            </p>
          {/* )} */}

          <div className="flex flex-col gap-3">
            <Link to={`/track-order?order=${orderId}`}>
              <Button variant="outline" className="rounded-full w-full">
                Track Your Order
              </Button>
            </Link>
            <Link to="/">
              <Button className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;

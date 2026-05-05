import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import GiftGrid from '@/components/GiftGrid';
import StatsBar from '@/components/StatsBar';
import CustomizeDeal from '@/components/CustomizeDeal';
import BundleSlider from '@/components/BundleSlider';
import CartDrawer from '@/components/CartDrawer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import Footer from '@/components/Footer';
import TestimonialsSlider from '@/components/TestimonialsSlider';
import ReviewDialog from '@/components/ReviewDialog';
import SEO from '@/components/SEO';

const Index = () => {
  const [searchParams] = useSearchParams();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  // Check for review parameters in URL
  useEffect(() => {
    const order = searchParams.get('order');
    const product = searchParams.get('product');
    
    // If both order and product params exist, open the review dialog
    if (order && product) {
      setReviewDialogOpen(true);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="GenZGifts - Unique & Trendy Gifts for Gen Z | Shop Online Pakistan"
        description="Shop the trendiest gifts for Gen Z in Pakistan. Customizable gift bundles, unique presents & free shipping on orders over Rs. 5000. Order now!"
        canonical="https://genzgifts.com/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "GenZGifts",
          "url": "https://genzgifts.com",
          "description": "Unique & trendy gifts for Gen Z in Pakistan",
          "potentialAction": { "@type": "SearchAction", "target": "https://genzgifts.com/?q={search_term_string}", "query-input": "required name=search_term_string" }
        }}
      />
      <Header />
      <CartDrawer />
      <ReviewDialog 
        open={reviewDialogOpen} 
        onOpenChange={setReviewDialogOpen} 
      />
      <main className="flex-1">
        <HeroBanner />
        <StatsBar />
        {/* <GiftGrid /> */}
        <BundleSlider />
        <CustomizeDeal />
        <TestimonialsSlider />
      </main>
      <Footer />
      <WhatsAppWidget />
    </div>
  );
};

export default Index;

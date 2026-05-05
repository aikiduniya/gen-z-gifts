import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Return Policy | GenZGifts" description="Read our return and refund policy." canonical="https://genzgifts.com/return-policy" />
      <Header />
      <main className="flex-1 container py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 ai-text-gradient" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Return Policy</h1>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>We want you to love your purchase. If you're not fully satisfied, you may request a return within <strong className="text-foreground">7 days</strong> of delivery.</p>
          <h2 className="text-xl font-semibold text-foreground mt-6">Eligibility</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Item must be unused, in original packaging, and in resalable condition.</li>
            <li>Customized or personalized gifts are non-returnable.</li>
            <li>Sale or discounted items are final sale.</li>
          </ul>
          <h2 className="text-xl font-semibold text-foreground mt-6">How to Request a Return</h2>
          <p>Contact us via WhatsApp with your order number and reason for return. Our team will guide you through the process.</p>
          <h2 className="text-xl font-semibold text-foreground mt-6">Refunds</h2>
          <p>Once received and inspected, refunds are processed within 5–7 business days to the original payment method.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReturnPolicy;

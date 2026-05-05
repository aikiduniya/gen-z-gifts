import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'How long does delivery take?', a: 'Orders are typically delivered within 3–5 business days across Pakistan.' },
  { q: 'What payment methods do you accept?', a: 'We accept Credit Card (Stripe), Cash on Delivery, and Advance Payment via Bank Transfer, EasyPaisa, or JazzCash.' },
  { q: 'Is shipping free?', a: 'Standard shipping is Rs. 99. Free shipping on orders over Rs. 5,000 or when paying via Advance Payment.' },
  { q: 'Can I track my order?', a: 'Yes! Use our Track Your Order page with your order number to see real-time status.' },
  { q: 'Can I return a product?', a: 'Yes, within 7 days of delivery if unused and in original packaging. See our Return Policy for details.' },
  { q: 'How do I contact customer support?', a: 'The fastest way is via WhatsApp using the chat button in the footer or floating widget.' },
];

const FAQs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="FAQs | GenZGifts" description="Frequently asked questions about GenZGifts orders, shipping and returns." canonical="https://genzgifts.com/faqs" />
      <Header />
      <main className="flex-1 container py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 ai-text-gradient" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Frequently Asked Questions</h1>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <Footer />
    </div>
  );
};

export default FAQs;

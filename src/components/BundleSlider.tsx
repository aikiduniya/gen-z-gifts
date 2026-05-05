import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { ScrollReveal } from './animations';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';

interface Bundle {
  id: string;
  name: string;
  image_url: string;
  min_items: number;
  is_active: boolean;
  display_order: number;
}

const BundleSlider = () => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const res = await api.getBundles();
      if (res.data) setBundles(res.data as Bundle[]);
    };
    load();
  }, []);

  const scrollBy = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const handleSelect = () => {
    const el = document.getElementById('customize');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (bundles.length === 0) return null;

  return (
    <section className="py-12 bg-background">
      <div className="container">
        <ScrollReveal>
          <div className="text-center mb-8">
            <h2
              className="text-3xl font-bold mb-2 ai-text-gradient"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Curated Gift Bundles
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Build your perfect bundle and save more.
            </p>
          </div>
        </ScrollReveal>

        <div className="relative">
          {bundles.length > 2 && (
            <>
              <button
                aria-label="Previous bundle"
                onClick={() => scrollBy('left')}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 h-10 w-10 rounded-full bg-background border-2 border-border shadow-lg items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                aria-label="Next bundle"
                onClick={() => scrollBy('right')}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 h-10 w-10 rounded-full bg-background border-2 border-border shadow-lg items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {bundles.map((bundle, i) => (
              <motion.button
                key={bundle.id}
                onClick={handleSelect}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="group relative snap-start flex-shrink-0 w-[75%] sm:w-[45%] md:w-[32%] lg:w-[24%] rounded-2xl overflow-hidden border-2 border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 text-left ai-border-gradient"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={bundle.image_url || '/placeholder.svg'}
                    alt={bundle.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="absolute top-2 left-2 bg-gradient-to-r from-primary to-accent text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Package className="h-3 w-3" />
                  {bundle.min_items}+ items
                </div>
                <div className="p-3 bg-background">
                  <p className="font-bold text-sm truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {bundle.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Min. {bundle.min_items} {bundle.min_items === 1 ? 'item' : 'items'} to build
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BundleSlider;

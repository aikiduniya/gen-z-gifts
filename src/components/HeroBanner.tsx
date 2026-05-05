import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import bannerFallback from '@/assets/banner.jpeg';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  sort_order: number;
}

const HeroBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const load = async () => {
      const res = await api.getBanners();
      if (!res.error && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setBanners(res.data);
      } else {
        // Fallback banner
        setBanners([{ id: 0, title: 'Basket For Him/Her', subtitle: '', image_url: bannerFallback, link_url: '', is_active: true, sort_order: 0 }]);
      }
    };
    load();
  }, []);

  // Auto-play
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  const prev = () => {
    setDirection(-1);
    setCurrent(c => (c - 1 + banners.length) % banners.length);
  };

  const next = () => {
    setDirection(1);
    setCurrent(c => (c + 1) % banners.length);
  };

  if (banners.length === 0) return null;

  const banner = banners[current];

  const variants = {
    enter: { opacity: 0, scale: 1.1 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  };

  // Ken Burns: alternate zoom direction per slide
  const kenBurnsVariants = {
    initial: (idx: number) => ({
      scale: 1,
      x: idx % 2 === 0 ? '0%' : '2%',
      y: idx % 2 === 0 ? '0%' : '1%',
    }),
    animate: (idx: number) => ({
      scale: 1.12,
      x: idx % 2 === 0 ? '2%' : '0%',
      y: idx % 2 === 0 ? '1%' : '0%',
      transition: { duration: 8, ease: 'linear' as const },
    }),
  };

  const content = (
    <section className="relative overflow-hidden">
      <div className="relative py-20 md:py-32 min-h-[420px] flex items-center">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={banner.id}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 overflow-hidden"
          >
            <motion.img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-full object-cover object-center"
              custom={current}
              variants={kenBurnsVariants}
              initial="initial"
              animate="animate"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background/95" />
          </motion.div>
        </AnimatePresence>

        <div className="container relative z-10">
          <motion.div
            key={`text-${banner.id}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
            className="text-center max-w-2xl mx-auto"
          >
            {banner.title && (
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
                <span className="ai-text-gradient">
                  {banner.title}
                </span>
              </h1>
            )}
            {banner.subtitle && (
              <p className="text-base md:text-lg text-muted-foreground mb-4">{banner.subtitle}</p>
            )}
            {banner.link_url && (
              <a href={banner.link_url}>
                <Button size="lg" className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 ai-glow-hover">
                  Shop Now
                </Button>
              </a>
            )}
          </motion.div>
        </div>

        {/* Nav Arrows */}
        {banners.length > 1 && (
          <>
            <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80" onClick={prev}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80" onClick={next}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${idx === current ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/40'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );

  return content;
};

export default HeroBanner;

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Ayesha Malik',
    location: 'Lahore',
    rating: 5,
    text: 'Ordered a gift basket for my best friend\'s birthday and she literally cried happy tears 😭❤️ Everything was so beautifully packed. Will definitely order again!',
    avatar: '👩‍🦱',
    tag: 'Birthday Gift',
  },
  {
    id: 2,
    name: 'Hassan Raza',
    location: 'Karachi',
    rating: 5,
    text: 'Got the customized deal for my girlfriend on our anniversary. She absolutely loved it! The quality is top-notch and delivery was super fast. 10/10 experience.',
    avatar: '👨‍🦲',
    tag: 'Anniversary',
  },
  {
    id: 3,
    name: 'Zara Khan',
    location: 'Islamabad',
    rating: 5,
    text: 'Best gifting store online! I\'ve ordered 3 times now and every time the packaging gets better. My whole friend group uses GenZGifts now lol 😂',
    avatar: '👩‍🦰',
    tag: 'Repeat Customer',
  },
  {
    id: 4,
    name: 'Bilal Ahmed',
    location: 'Faisalabad',
    rating: 5,
    text: 'The aesthetic is unmatched. Ordered for my mom\'s birthday and she kept saying how pretty everything looked. Same day dispatch too which was amazing!',
    avatar: '👦',
    tag: 'Mother\'s Day',
  },
  {
    id: 5,
    name: 'Sara Nawaz',
    location: 'Multan',
    rating: 5,
    text: 'I was skeptical at first but the products are genuinely high quality. The basket came perfectly arranged and the little note card was such a sweet touch 🥺',
    avatar: '👩',
    tag: 'First Order',
  },
];

const TestimonialsSlider = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => {
    setDirection('right');
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setDirection('left');
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  const visibleIndices = [
    (current - 1 + testimonials.length) % testimonials.length,
    current,
    (current + 1) % testimonials.length,
  ];

  return (
    <section className="py-16 bg-muted/20 overflow-hidden">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            What our{' '}
            <span className="ai-text-gradient">
              customers say
            </span>
          </h2>
          <p className="text-muted-foreground mt-2">Real reviews from real happy gifters 💝</p>
        </motion.div>

        {/* Slider */}
        <div
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Cards row */}
          <div className="hidden md:flex gap-5 items-center justify-center">
            {visibleIndices.map((idx, pos) => {
              const t = testimonials[idx];
              const isCenter = pos === 1;
              return (
                <motion.div
                  key={`${idx}-${current}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{
                    opacity: isCenter ? 1 : 0.55,
                    scale: isCenter ? 1 : 0.88,
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className={`relative rounded-3xl border border-border bg-card p-6 flex-1 max-w-sm transition-all ${
                    isCenter ? 'shadow-xl ring-2 ring-primary/20 z-10' : 'shadow-md'
                  }`}
                >
                  {/* Quote icon */}
                  <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <Quote className="w-4 h-4 text-primary-foreground" />
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3 mt-2">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t.text}</p>

                  <div className="flex items-center gap-3">
                    <div className="text-2xl w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.location}</p>
                    </div>
                    <span className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {t.tag}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile: single card */}
          <div className="md:hidden px-4">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={{
                  enter: (dir: string) => ({ x: dir === 'right' ? 80 : -80, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (dir: string) => ({ x: dir === 'right' ? -80 : 80, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="relative rounded-3xl border border-border bg-card p-6 shadow-xl ring-2 ring-primary/20"
              >
                <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Quote className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex gap-0.5 mb-3 mt-2">
                  {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{testimonials[current].text}</p>
                <div className="flex items-center gap-3">
                  <div className="text-2xl w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {testimonials[current].avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{testimonials[current].name}</p>
                    <p className="text-xs text-muted-foreground">{testimonials[current].location}</p>
                  </div>
                  <span className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {testimonials[current].tag}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all flex items-center justify-center shadow-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 'right' : 'left'); setCurrent(i); }}
                  className={`transition-all rounded-full ${
                    i === current
                      ? 'w-6 h-2.5 bg-primary'
                      : 'w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all flex items-center justify-center shadow-sm"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;

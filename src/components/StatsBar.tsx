import { Package, Tag, MapPin, Heart } from 'lucide-react';
import { ScrollReveal } from './animations';

const stats = [
  { icon: Package, value: '1000+', label: 'Orders Delivered' },
  { icon: Tag, value: 'Rs. 299', label: 'Starting Price' },
  { icon: MapPin, value: 'All Cities', label: 'Pakistan Available' },
  { icon: Heart, value: '950+', label: 'Happy Customers' },
];

const StatsBar = () => {
  return (
    <section className="py-8 md:py-12 bg-muted/30 border-y border-border/40">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur p-4 md:p-6 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="mx-auto mb-3 flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md">
                      <Icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div className="text-lg md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      {s.value}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;

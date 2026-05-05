import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';
import { useSettingsStore } from '@/lib/settings-store';
import logo from '@/assets/genzgifts-logo.png';
import { useEffect } from 'react';

const Header = () => {
  const toggleCart = useCartStore((s) => s.toggleCart);
  const items = useCartStore((s) => s.items);
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const storeName = settings?.store_name || 'GenZGifts';

  const marqueeItems = [
    '100+ Orders Delivered',
    'Free Shipping on Rs. 3,000+',
    'Advance Pay = Free Shipping',
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      {/* Static announcement strip */}
      <div className="w-full bg-primary">
        <div className="container flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-1.5">
          {marqueeItems.map((item, i) => (
            <span key={i} className="text-[11px] font-medium text-primary-foreground">
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logo} alt={storeName} className="h-10 w-10 rounded-lg object-cover" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent pl-2 border-l-2 border-l-primary"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {storeName}
          </span>
          <span className="text-lg ml-1" title="Made in Pakistan 🇵🇰">🇵🇰</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#shop" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Shop</a>
          {/* <a href="#customize" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Customize</a> */}
          <Link to="/track-order" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Track Order</Link>
        </nav>

        <Button variant="ghost" size="icon" className="relative" onClick={toggleCart}>
          <ShoppingCart className="h-5 w-5" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
              {items.length}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;

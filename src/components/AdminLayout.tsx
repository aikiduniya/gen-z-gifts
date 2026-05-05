import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, Tags, Star, Menu, Tag, Users, Image, Boxes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import logo from '@/assets/genzgifts-logo.png';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/banners', label: 'Banners', icon: Image },
  { to: '/admin/bundles', label: 'Bundles', icon: Boxes },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag },
  { to: '/admin/visitors', label: 'Visitors', icon: Users },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const check = async () => {
      const response = await api.getUser();
      if (response.error || !response.data?.isAdmin) {
        navigate('/admin/login');
        return;
      }
      setLoading(false);
    };
    check();
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  // Render sidebar content (used by both desktop and mobile)
  const renderSidebarContent = () => (
    <>
      <div className="p-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="GenZGifts" className="h-8 w-8 rounded-lg object-cover" />
          <span className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            GenZGifts Admin
          </span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {adminLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={() => isMobile && setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === to ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={async () => {
          await api.logout();
          localStorage.removeItem('access_token');
          navigate('/admin/login');
        }}>
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex">
      {/* Mobile Header - visible only on mobile */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 border-b bg-card md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} className="h-9 w-9">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="GenZGifts" className="h-7 w-7 rounded-lg object-cover" />
            <span className="font-bold text-sm bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              GenZGifts Admin
            </span>
          </Link>
        </header>
      )}

      {/* Desktop Sidebar - hidden on mobile, visible on md+ */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar - Sheet component */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 border-r">
          <div className="flex flex-col h-full">
            {renderSidebarContent()}
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <div className="p-4 md:p-8 min-h-[calc(100vh-3.5rem)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

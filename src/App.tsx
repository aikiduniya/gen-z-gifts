import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations";
import Index from "./pages/Index";
import GiftDetail from "./pages/GiftDetail";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import TrackOrder from "./pages/TrackOrder";
import Review from "./pages/Review";
import ReturnPolicy from "./pages/ReturnPolicy";
import FAQs from "./pages/FAQs";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminCategories from "./pages/AdminCategories";
import AdminOrders from "./pages/AdminOrders";
import AdminReviews from "./pages/AdminReviews";
import AdminCoupons from "./pages/AdminCoupons";
import AdminVisitors from "./pages/AdminVisitors";
import AdminSettings from "./pages/AdminSettings";
import AdminBanners from "./pages/AdminBanners";
import AdminBundles from "./pages/AdminBundles";
import NotFound from "./pages/NotFound";
import { ScrollToTop } from "./components/ScrollToTop";
import VisitorTracker from "./components/VisitorTracker";
import GeoBlocker from "./components/GeoBlocker";
import { api } from "@/lib/api";

const queryClient = new QueryClient();

// Component to inject custom scripts into the DOM
const ScriptInjector = () => {
  const [scripts, setScripts] = useState({ header_script: "", body_script: "", footer_script: "" });

  useEffect(() => {
    const loadSettings = async () => {
      const res = await api.getSiteSettings();
      if (res.data) {
        setScripts({
          header_script: res.data.header_script || "",
          body_script: res.data.body_script || "",
          footer_script: res.data.footer_script || "",
        });
      }
    };
    loadSettings();
  }, []);

  // Inject header scripts into document head
  useEffect(() => {
    if (!scripts.header_script) return;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<html><head></head><body>${scripts.header_script}</body></html>`, 'text/html');
    const headElements = doc.querySelectorAll('head > *');
    
    headElements.forEach((el) => {
      if (el.tagName === 'SCRIPT') {
        const script = document.createElement('script');
        script.innerHTML = el.innerHTML;
        Array.from(el.attributes).forEach(attr => {
          script.setAttribute(attr.name, attr.value);
        });
        document.head.appendChild(script);
      } else {
        document.head.appendChild(el.cloneNode(true));
      }
    });
  }, [scripts.header_script]);

  // Inject body scripts after body opens
  useEffect(() => {
    if (!scripts.body_script) return;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<html><head></head><body>${scripts.body_script}</body></html>`, 'text/html');
    const bodyElements = doc.querySelectorAll('body > *');
    
    const root = document.getElementById('root');
    if (root) {
      bodyElements.forEach((el) => {
        if (el.tagName === 'SCRIPT') {
          const script = document.createElement('script');
          script.innerHTML = el.innerHTML;
          Array.from(el.attributes).forEach(attr => {
            script.setAttribute(attr.name, attr.value);
          });
          root.parentNode?.insertBefore(script, root);
        } else {
          root.parentNode?.insertBefore(el.cloneNode(true), root);
        }
      });
    }
  }, [scripts.body_script]);

  // Inject footer scripts before closing body tag
  useEffect(() => {
    if (!scripts.footer_script) return;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<html><head></head><body>${scripts.footer_script}</body></html>`, 'text/html');
    const bodyElements = doc.querySelectorAll('body > *');
    
    bodyElements.forEach((el) => {
      if (el.tagName === 'SCRIPT') {
        const script = document.createElement('script');
        script.innerHTML = el.innerHTML;
        Array.from(el.attributes).forEach(attr => {
          script.setAttribute(attr.name, attr.value);
        });
        document.body.appendChild(script);
      } else {
        document.body.appendChild(el.cloneNode(true));
      }
    });
  }, [scripts.footer_script]);

  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/gift/:slug" element={<PageTransition><GiftDetail /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/order-confirmation/:orderId" element={<PageTransition><OrderConfirmation /></PageTransition>} />
        <Route path="/review" element={<PageTransition><Review /></PageTransition>} />
        <Route path="/track-order" element={<PageTransition><TrackOrder /></PageTransition>} />
        <Route path="/return-policy" element={<PageTransition><ReturnPolicy /></PageTransition>} />
        <Route path="/faqs" element={<PageTransition><FAQs /></PageTransition>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="bundles" element={<AdminBundles />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="visitors" element={<AdminVisitors />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ScriptInjector />
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <GeoBlocker>
          <VisitorTracker />
          <AnimatedRoutes />
        </GeoBlocker>

      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

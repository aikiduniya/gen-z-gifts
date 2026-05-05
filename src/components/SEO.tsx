import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  type?: string;
  jsonLd?: Record<string, any>;
}

const SEO = ({ title, description, canonical, ogImage, type = 'website', jsonLd }: SEOProps) => {
  useEffect(() => {
    const fullTitle = title.includes('GenZGifts') ? title : `${title} | GenZGifts`;
    document.title = fullTitle;

    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', type, 'property');
    setMeta('twitter:title', fullTitle, 'name');
    setMeta('twitter:description', description, 'name');

    if (ogImage) {
      setMeta('og:image', ogImage, 'property');
      setMeta('twitter:image', ogImage, 'name');
    }

    if (canonical) {
      setMeta('og:url', canonical, 'property');
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // JSON-LD
    const existingLd = document.getElementById('seo-jsonld');
    if (existingLd) existingLd.remove();
    if (jsonLd) {
      const script = document.createElement('script');
      script.id = 'seo-jsonld';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const ld = document.getElementById('seo-jsonld');
      if (ld) ld.remove();
    };
  }, [title, description, canonical, ogImage, type, jsonLd]);

  return null;
};

export default SEO;

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '@/lib/api';

const getSessionId = () => {
  let sid = sessionStorage.getItem('visitor_sid');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('visitor_sid', sid);
  }
  return sid;
};

const VisitorTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Skip tracking admin pages
    if (location.pathname.startsWith('/admin')) return;

    const track = async () => {
      const sessionId = getSessionId();

      // Get geo info via CORS proxy
      const { country, city } = await api.getGeo();

      await api.trackVisitor({
        page_url: location.pathname,
        referrer: document.referrer || '',
        country,
        city,
        user_agent: navigator.userAgent,
        session_id: sessionId,
      });
    };

    track();
  }, [location.pathname]);

  return null;
};

export default VisitorTracker;

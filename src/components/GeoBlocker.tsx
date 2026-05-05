import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Globe, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GeoInfo {
  country: string;
  city: string;
}

const PAKISTAN_COUNTRIES = ['Pakistan', 'PK'];

const GeoBlocker = ({ children }: { children: React.ReactNode }) => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [geoInfo, setGeoInfo] = useState<GeoInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkGeo = async () => {
      try {
        setLoading(true);
        const geo = await api.getGeo();
        setGeoInfo(geo);
        const country = geo.country.toLowerCase();
        const allowed = PAKISTAN_COUNTRIES.some(pk => country === pk.toLowerCase());
        setIsAllowed(allowed);
      } catch (error) {
        // Default allow on error (no block)
        setIsAllowed(true);
      } finally {
        setLoading(false);
      }
    };

    checkGeo();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary mx-auto mb-4 rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Checking location...</p>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-destructive mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-background" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Location Restricted
            </CardTitle>
            <p className="text-muted-foreground text-sm">Detected: {geoInfo?.city}, {geoInfo?.country}</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            <p className="text-center text-foreground/80 text-sm leading-relaxed">
              This website is only available for visitors from <strong>Pakistan</strong>. 
              If you are in Pakistan, please disable any VPN/proxy and refresh the page.
            </p>
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Contact us if you need assistance:</p>
              <div className="flex items-center gap-2 justify-center">
                <Mail className="w-4 h-4" />
                <span>support@genzgifts.com</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Phone className="w-4 h-4" />
                <span>+92 300 1234567</span>
              </div>
            </div>
            <div className="pt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.reload()}
              >
                Refresh &amp; Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default GeoBlocker;


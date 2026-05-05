import { Copy, Upload, CheckCircle, X, Image } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { compressImage } from '@/lib/image-compress';

interface PaymentDetail {
  label: string;
  value: string;
}

interface PaymentAccount {
  method: string;
  details: PaymentDetail[];
}

interface PaymentAccountDetailsProps {
  onScreenshotUploaded?: (url: string) => void;
  screenshotUrl?: string;
  showUpload?: boolean;
}

const PaymentAccountDetails = ({ onScreenshotUploaded, screenshotUrl, showUpload = true }: PaymentAccountDetailsProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSiteSettings();
        if (res.data && res.data.payment_accounts && res.data.payment_accounts.length > 0) {
          setPaymentAccounts(res.data.payment_accounts);
        }
      } catch (error) {
        console.error('Error fetching payment accounts:', error);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const compressedFile = await compressImage(file);
      const result = await api.uploadPaymentScreenshot(compressedFile);
      
      if (result.error) throw new Error(result.error);
      if (result.url) {
        onScreenshotUploaded?.(result.url);
        toast.success('Screenshot uploaded!');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Payment Details</h3>
      
      {!loadingSettings && paymentAccounts.map((account, index) => (
        <div key={index} className="rounded-lg border border-border bg-card p-4">
          <h4 className="font-medium text-primary mb-3">{account.method}</h4>
          <div className="space-y-2">
            {account.details.map((d, detailIndex) => (
              <div key={detailIndex} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{d.label}:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-medium text-foreground">{d.value}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(d.value)}
                    className="p-0.5 rounded hover:bg-muted transition-colors"
                  >
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {showUpload && (
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-2">Upload payment screenshot (optional):</p>
          {screenshotUrl ? (
            <div className="relative rounded-lg border border-primary/30 bg-primary/5 p-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs text-foreground truncate flex-1">Screenshot uploaded</span>
              <button
                type="button"
                onClick={() => onScreenshotUploaded?.('')}
                className="p-0.5 rounded hover:bg-muted"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-border hover:border-primary/40 transition-colors text-sm text-muted-foreground hover:text-foreground"
            >
              {uploading ? (
                <>
                  <Upload className="h-4 w-4 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <Image className="h-4 w-4" />
                  Click to upload screenshot
                </>
              )}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default PaymentAccountDetails;

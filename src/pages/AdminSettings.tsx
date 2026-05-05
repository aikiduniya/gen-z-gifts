import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';

interface PaymentAccount {
  method: string;
  details: { label: string; value: string }[];
}

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    id: '', store_name: '', email: '', phone: '', address: '', instagram_url: '', tiktok_id: '',
    header_script: '', body_script: '', footer_script: '', payment_accounts: [] as PaymentAccount[],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await api.getSiteSettings();
      if (res.data) {
        setSettings({
          id: res.data.id || '',
          store_name: res.data.store_name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
          instagram_url: res.data.instagram_url || '',
          tiktok_id: res.data.tiktok_id || '',
          header_script: res.data.header_script || '',
          body_script: res.data.body_script || '',
          footer_script: res.data.footer_script || '',
          payment_accounts: res.data.payment_accounts || [],
        });
      } else if (res.error) {
        toast.error('Failed to load settings: ' + res.error);
      }
    };
    load();
  }, []);

  const addPaymentAccount = () => {
    setSettings({
      ...settings,
      payment_accounts: [
        ...settings.payment_accounts,
        { method: '', details: [{ label: '', value: '' }] }
      ]
    });
  };

  const updatePaymentAccountMethod = (index: number, value: string) => {
    const updated = [...settings.payment_accounts];
    updated[index].method = value;
    setSettings({ ...settings, payment_accounts: updated });
  };

  const addDetailField = (accountIndex: number) => {
    const updated = [...settings.payment_accounts];
    updated[accountIndex].details.push({ label: '', value: '' });
    setSettings({ ...settings, payment_accounts: updated });
  };

  const updateDetailField = (accountIndex: number, detailIndex: number, field: 'label' | 'value', value: string) => {
    const updated = [...settings.payment_accounts];
    updated[accountIndex].details[detailIndex][field] = value;
    setSettings({ ...settings, payment_accounts: updated });
  };

  const removeDetailField = (accountIndex: number, detailIndex: number) => {
    const updated = [...settings.payment_accounts];
    updated[accountIndex].details.splice(detailIndex, 1);
    setSettings({ ...settings, payment_accounts: updated });
  };

  const removePaymentAccount = (index: number) => {
    const updated = settings.payment_accounts.filter((_, i) => i !== index);
    setSettings({ ...settings, payment_accounts: updated });
  };

  const save = async () => {
    setLoading(true);
    try {
      const res = await api.updateSiteSettings({
        store_name: settings.store_name,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        instagram_url: settings.instagram_url,
        tiktok_id: settings.tiktok_id,
        header_script: settings.header_script,
        body_script: settings.body_script,
        footer_script: settings.footer_script,
        payment_accounts: settings.payment_accounts,
      });
      if (res.data) {
        toast.success('Settings saved');
      } else {
        toast.error(res.error || 'Failed to save settings');
      }
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Website Settings</h1>
      
      <div className="flex gap-6 mb-6 flex-wrap">
        <Card className="flex-1 min-w-[400px]">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Store Name</Label><Input value={settings.store_name} onChange={(e) => setSettings({ ...settings, store_name: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} /></div>
            <div><Label>Address</Label><Input value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} /></div>
            <div><Label>Instagram URL</Label><Input value={settings.instagram_url} onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })} /></div>
            <div><Label>Tiktok ID</Label><Input value={settings.tiktok_id} onChange={(e) => setSettings({ ...settings, tiktok_id: e.target.value })} /></div>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-[400px]">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Payment Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.payment_accounts.map((account, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <Label>Payment Method</Label>
                    <Input 
                      placeholder="e.g., Bank Transfer, EasyPaisa, JazzCash" 
                      value={account.method}
                      onChange={(e) => updatePaymentAccountMethod(index, e.target.value)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => removePaymentAccount(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Account Details</Label>
                  {account.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input
                          placeholder="Label (e.g., Account No)"
                          value={detail.label}
                          onChange={(e) => updateDetailField(index, detailIndex, 'label', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Value"
                          value={detail.value}
                          onChange={(e) => updateDetailField(index, detailIndex, 'value', e.target.value)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeDetailField(index, detailIndex)}
                        disabled={account.details.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addDetailField(index)}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Field
                  </Button>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addPaymentAccount}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Payment Account
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-6 mb-6">
        <Card className="flex-1 min-w-[400px]">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Custom Scripts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Header Script</Label>
              <p className="text-xs text-muted-foreground mb-2">Scripts to add in the head section (Google Analytics, pixel code, etc.)</p>
              <Textarea 
                value={settings.header_script} 
                onChange={(e) => setSettings({ ...settings, header_script: e.target.value })}
                placeholder="<script>...</script>"
                className="font-mono text-sm"
                rows={4}
              />
            </div>
            <div>
              <Label>Body Script</Label>
              <p className="text-xs text-muted-foreground mb-2">Scripts to add immediately after body opens</p>
              <Textarea 
                value={settings.body_script} 
                onChange={(e) => setSettings({ ...settings, body_script: e.target.value })}
                placeholder="<script>...</script>"
                className="font-mono text-sm"
                rows={4}
              />
            </div>
            <div>
              <Label>Footer Script</Label>
              <p className="text-xs text-muted-foreground mb-2">Scripts to add at the end of the body (Google Tag Manager, chat widgets, etc.)</p>
              <Textarea 
                value={settings.footer_script} 
                onChange={(e) => setSettings({ ...settings, footer_script: e.target.value })}
                placeholder="<script>...</script>"
                className="font-mono text-sm"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground" onClick={save} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;

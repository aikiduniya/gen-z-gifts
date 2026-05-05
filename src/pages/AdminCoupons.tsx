import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Tag, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
}

const emptyCoupon = {
  code: '',
  description: '',
  discount_type: 'percentage' as const,
  discount_value: 0,
  min_order_amount: 0,
  max_uses: 10,
  is_active: true,
  valid_from: '',
  valid_until: '',
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<Partial<Coupon> | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadCoupons = async () => {
    const res = await api.getCoupons();
    if (res.data) {
      setCoupons(res.data);
    } else {
      toast.error(res.error || 'Failed to load coupons');
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSave = async () => {
    if (!editing?.code) {
      toast.error('Coupon code is required');
      return;
    }
    if (!editing?.discount_type || !editing?.discount_value) {
      toast.error('Discount type and value are required');
      return;
    }

    setLoading(true);
    try {
      const couponData = {
        code: editing.code.toUpperCase(),
        description: editing.description || '',
        discount_type: editing.discount_type,
        discount_value: editing.discount_value,
        min_order_amount: editing.min_order_amount || 0,
        max_uses: editing.max_uses || 100,
        is_active: editing.is_active ?? true,
        valid_from: editing.valid_from || null,
        valid_until: editing.valid_until || null,
      };

      let res;
      if (editing.id) {
        res = await api.updateCoupon(editing.id, couponData);
      } else {
        res = await api.createCoupon(couponData);
      }

      if (res.data) {
        toast.success(editing.id ? 'Coupon updated' : 'Coupon created');
        setOpen(false);
        setEditing(null);
        loadCoupons();
      } else {
        toast.error(res.error || 'Failed to save coupon');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    
    const res = await api.deleteCoupon(id);
    if (res.data) {
      toast.success('Coupon deleted');
      loadCoupons();
    } else {
      toast.error(res.error || 'Failed to delete coupon');
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    const res = await api.updateCoupon(coupon.id, {
      is_active: !coupon.is_active,
    });
    if (res.data) {
      toast.success(coupon.is_active ? 'Coupon deactivated' : 'Coupon activated');
      loadCoupons();
    } else {
      toast.error(res.error || 'Failed to update coupon');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No expiration';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Coupons</h1>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setEditing(null);
        }}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs sm:text-sm" onClick={() => setEditing({ ...emptyCoupon })}>
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent disableOutsideClick className="max-w-[425px] w-[95vw]">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {editing?.id ? 'Edit Coupon' : 'Add Coupon'}
              </DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-4">
                <div>
                  <Label>Coupon Code</Label>
                  <Input 
                    value={editing.code || ''} 
                    onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., SAVE20"
                    disabled={!!editing.id}
                  />
                </div>
                
                <div>
                  <Label>Description (Optional)</Label>
                  <Input 
                    value={editing.description || ''} 
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    placeholder="e.g., Summer sale discount"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Discount Type</Label>
                    <select
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                      value={editing.discount_type || 'percentage'}
                      onChange={(e) => setEditing({ ...editing, discount_type: e.target.value as 'percentage' | 'fixed' })}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (PKR)</option>
                    </select>
                  </div>
                  <div>
                    <Label>Discount Value</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editing.discount_value || 0}
                      onChange={(e) => setEditing({ ...editing, discount_value: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Min Order Amount (PKR)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editing.min_order_amount || 0}
                      onChange={(e) => setEditing({ ...editing, min_order_amount: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Max Uses</Label>
                    <Input
                      type="number"
                      min="1"
                      value={editing.max_uses || 100}
                      onChange={(e) => setEditing({ ...editing, max_uses: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Valid From</Label>
                    <Input
                      type="date"
                      value={editing.valid_from || ''}
                      onChange={(e) => setEditing({ ...editing, valid_from: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Valid Until</Label>
                    <Input
                      type="date"
                      value={editing.valid_until || ''}
                      onChange={(e) => setEditing({ ...editing, valid_until: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editing.is_active ?? true}
                    onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <Button 
                  className="w-full rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground" 
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editing?.id ? 'Update Coupon' : 'Create Coupon'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2 sm:p-3 font-medium">Code</th>
              <th className="text-left p-2 sm:p-3 font-medium hidden md:table-cell">Description</th>
              <th className="text-right p-2 sm:p-3 font-medium">Discount</th>
              <th className="text-right p-2 sm:p-3 font-medium hidden sm:table-cell">Min Order</th>
              <th className="text-center p-2 sm:p-3 font-medium hidden lg:table-cell">Usage</th>
              <th className="text-center p-2 sm:p-3 font-medium">Status</th>
              <th className="text-right p-2 sm:p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-t">
                <td className="p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{coupon.code}</span>
                  </div>
                </td>
                <td className="p-2 sm:p-3 hidden md:table-cell text-muted-foreground text-sm">
                  {coupon.description || '-'}
                </td>
                <td className="p-2 sm:p-3 text-right font-medium">
                  {coupon.discount_type === 'percentage' 
                    ? `${coupon.discount_value}%` 
                    : `Rs. ${coupon.discount_value}`}
                </td>
                <td className="p-2 sm:p-3 text-right hidden sm:table-cell text-muted-foreground">
                  Rs. {coupon.min_order_amount}
                </td>
                <td className="p-2 sm:p-3 text-center hidden lg:table-cell">
                  <span className="text-muted-foreground">
                    {coupon.current_uses} / {coupon.max_uses}
                  </span>
                </td>
                <td className="p-2 sm:p-3 text-center">
                  {coupon.is_active ? (
                    <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                      <CheckCircle className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-500 text-xs">
                      <XCircle className="h-3 w-3" /> Inactive
                    </span>
                  )}
                </td>
                <td className="p-2 sm:p-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => toggleActive(coupon)}
                      title={coupon.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {coupon.is_active ? (
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => {
                        setEditing({
                          ...coupon,
                          valid_from: coupon.valid_from ? coupon.valid_from.split('T')[0] : '',
                          valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
                        });
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive" 
                      onClick={() => handleDelete(coupon.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 sm:p-8 text-center text-muted-foreground">
                  No coupons yet. Create your first coupon!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCoupons;

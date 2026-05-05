import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Image, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  sort_order: number;
}

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({ title: '', subtitle: '', image_url: '', link_url: '', is_active: true, sort_order: 0 });

  const load = async () => {
    setLoading(true);
    const res = await api.getAdminBanners();
    if (!res.error && res.data) setBanners(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', subtitle: '', image_url: '', link_url: '', is_active: true, sort_order: banners.length });
    setDialogOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditing(b);
    setForm({ title: b.title, subtitle: b.subtitle, image_url: b.image_url, link_url: b.link_url, is_active: b.is_active, sort_order: b.sort_order });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const res = await api.uploadImage(file);
    if (res.url) {
      setForm(f => ({ ...f, image_url: res.url! }));
    } else {
      toast({ title: 'Upload failed', description: res.error, variant: 'destructive' });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.image_url) {
      toast({ title: 'Image required', variant: 'destructive' });
      return;
    }

    let res;
    if (editing) {
      res = await api.updateBanner(String(editing.id), form);
    } else {
      res = await api.createBanner(form);
    }

    if (res.error) {
      toast({ title: 'Error', description: res.error, variant: 'destructive' });
    } else {
      toast({ title: editing ? 'Banner updated' : 'Banner created' });
      setDialogOpen(false);
      load();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this banner?')) return;
    const res = await api.deleteBanner(String(id));
    if (!res.error) {
      toast({ title: 'Banner deleted' });
      load();
    }
  };

  const moveOrder = async (index: number, dir: -1 | 1) => {
    const swapIdx = index + dir;
    if (swapIdx < 0 || swapIdx >= banners.length) return;
    const a = banners[index];
    const b = banners[swapIdx];
    await api.updateBanner(String(a.id), { ...a, sort_order: b.sort_order });
    await api.updateBanner(String(b.id), { ...b, sort_order: a.sort_order });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Banner</Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Image className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No banners yet. Add your first banner slide.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Order</TableHead>
                <TableHead className="w-24">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead className="w-20">Active</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((b, idx) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveOrder(idx, -1)} disabled={idx === 0}>
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveOrder(idx, 1)} disabled={idx === banners.length - 1}>
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {b.image_url ? (
                      <img src={b.image_url} alt={b.title} className="h-12 w-20 object-cover rounded" />
                    ) : (
                      <div className="h-12 w-20 bg-muted rounded flex items-center justify-center">
                        <Image className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{b.title || '—'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{b.subtitle || '—'}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {b.is_active ? 'Yes' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(b.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()} className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Banner Image *</Label>
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="h-32 w-full object-cover rounded-lg mt-1 mb-2" />
              )}
              <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Banner headline" />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Optional subtitle text" />
            </div>
            <div>
              <Label>Link URL</Label>
              <Input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder="e.g. /gift/some-product or https://..." />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Active</Label>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={uploading}>
              {editing ? 'Update Banner' : 'Create Banner'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBanners;

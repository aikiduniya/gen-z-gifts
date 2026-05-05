import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface Category {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const load = async () => {
    const res = await api.getCategories();
    if (res.data) {
      setCategories(res.data);
    } else {
      toast.error(res.error || 'Failed to load categories');
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [categories.length]);

  const save = async () => {
    if (!editing?.name?.trim()) { toast.error('Name is required'); return; }
    try {
      if (editing.id) {
        const res = await api.updateCategory(editing.id, { name: editing.name.trim(), is_active: editing.is_active ?? true });
        if (res.error) throw new Error(res.error);
        toast.success('Category updated');
      } else {
        const res = await api.createCategory({ name: editing.name.trim(), is_active: editing.is_active ?? true });
        if (res.error) throw new Error(res.error);
        toast.success('Category added');
      }
      setOpen(false);
      setEditing(null);
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this category? Products using it will keep their current category text.')) return;
    const res = await api.deleteCategory(id);
    if (res.data) {
      toast.success('Category deleted');
      load();
    } else {
      toast.error(res.error || 'Failed to delete category');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Categories</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground" onClick={() => setEditing({ name: '', is_active: true })}>
              <Plus className="h-4 w-4 mr-1" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent disableOutsideClick className="max-w-sm">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{editing?.id ? 'Edit Category' : 'Add Category'}</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-3">
                <Input placeholder="Category name" value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                  <span className="text-sm">Active</span>
                </div>
                <Button className="w-full rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground" onClick={save}>Save</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing({ ...c }); setOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(c.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No categories yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(currentPage - 1)} 
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink 
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(currentPage + 1)} 
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;

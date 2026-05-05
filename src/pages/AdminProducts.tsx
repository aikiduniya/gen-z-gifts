import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Upload, X, GripVertical, Save } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { compressImages } from '@/lib/image-compress';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number | string | null;
  image_urls: string[];
  category: string;
  stock: number;
  is_active: boolean;
  sort_order?: number;
}

const ITEMS_PER_PAGE = 10;

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'header': [1, 2, 3, false] }],
    [{ 'color': [] }],
    ['clean'],
  ],
};

const quillFormats = ['bold', 'italic', 'underline', 'strike', 'list', 'header', 'color'];

const emptyProduct = { name: '', description: '', price: 0, discount_price: 0, image_urls: [] as string[], category: 'General', stock: 0, is_active: true };

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [reorderableProducts, setReorderableProducts] = useState<Product[]>([]);

  const activeProducts = products.filter(p => p.is_active);
  const inactiveProducts = products.filter(p => !p.is_active);
  
  const currentProducts = isReordering 
    ? reorderableProducts 
    : (activeTab === 'active' ? activeProducts : inactiveProducts);
  
  const totalPages = Math.ceil(currentProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = currentProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const load = async () => {
    const productsRes = await api.getAdminProduct();
    if (productsRes.data) {
      setProducts(productsRes.data);
    } else {
      toast.error(productsRes.error || 'Failed to load products');
    }
    const catsRes = await api.getCategoriesList();
    if (catsRes.data) {
      setCategories(catsRes.data.map((c: any) => c));
    } else {
      toast.error(catsRes.error || 'Failed to load categories');
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [products.length, activeTab]);

  useEffect(() => {
    const filteredProducts = activeTab === 'active' ? activeProducts : inactiveProducts;
    setReorderableProducts([...filteredProducts]);
  }, [activeTab, products]);

  useEffect(() => {
    if (!open) {
      setSelectedFiles([]);
      setPreviewUrls([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open]);

  useEffect(() => {
    if (editing?.image_urls && editing.image_urls.length > 0 && selectedFiles.length === 0) {
      setPreviewUrls([...editing.image_urls]);
    }
  }, [editing]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error('Only image files (JPEG, PNG, GIF, WebP) are allowed');
      return;
    }

    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select image files');
      return;
    }
    setUploading(true);
    try {
      toast.info('Optimizing images...');
      const compressedFiles = await compressImages(selectedFiles);
      const result = await api.uploadMultipleImages(compressedFiles);
      if (result.urls && result.urls.length > 0) {
        const existingUrls = editing?.image_urls || [];
        const allUrls = [...existingUrls, ...result.urls];
        setEditing({ ...editing!, image_urls: allUrls });
        setPreviewUrls([...allUrls]);
        setSelectedFiles([]);
        toast.success(`${result.urls.length} image(s) uploaded successfully`);
      } else {
        toast.error(result.error || 'Failed to upload images');
      }
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    if (editing && editing.image_urls && index < editing.image_urls.length) {
      const newImageUrls = (editing.image_urls || []).filter((_, i) => i !== index);
      const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
      setEditing({ ...editing, image_urls: newImageUrls });
      setPreviewUrls(newPreviewUrls);
    } else {
      const uploadedCount = editing?.image_urls?.length || 0;
      const previewIndexToRemove = index;
      const newPreviewUrls = previewUrls.filter((_, i) => i !== previewIndexToRemove);
      setPreviewUrls(newPreviewUrls);
      
      const fileIndexToRemove = previewIndexToRemove - uploadedCount;
      if (fileIndexToRemove >= 0 && fileIndexToRemove < selectedFiles.length) {
        const newSelectedFiles = selectedFiles.filter((_, i) => i !== fileIndexToRemove);
        setSelectedFiles(newSelectedFiles);
      }
    }
  };

  const clearAllImages = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    setEditing({ ...editing!, image_urls: [] });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const save = async () => {
    if (saving) return;
    if (!editing?.name) { toast.error('Name is required'); return; }
    setSaving(true);
    const productData = {
      name: editing.name,
      description: editing.description || '',
      price: editing.price || 0,
      discount_price: editing.discount_price || 0,
      image_urls: editing.image_urls || [],
      category: editing.category || 'General',
      stock: editing.stock || 0,
      is_active: editing.is_active ?? true,
    };
    try {
      if (editing.id) {
        const res = await api.updateProduct(editing.id, productData);
        if (res.data) {
          toast.success('Product updated');
        } else {
          toast.error(res.error || 'Failed to update product');
          return;
        }
      } else {
        const res = await api.createProduct(productData);
        if (res.data) {
          toast.success('Product added');
        } else {
          toast.error(res.error || 'Failed to add product');
          return;
        }
      }
      setOpen(false);
      setEditing(null);
      setSelectedFiles([]);
      setPreviewUrls([]);
      load();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const res = await api.deleteProduct(id);
    if (res.data) {
      toast.success('Product deleted');
      load();
    } else {
      toast.error(res.error || 'Failed to delete product');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    
    const newProducts = [...reorderableProducts];
    const draggedProduct = newProducts[draggedItem];
    newProducts.splice(draggedItem, 1);
    newProducts.splice(index, 0, draggedProduct);
    setReorderableProducts(newProducts);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const saveProductOrder = async () => {
    const productsWithOrder = reorderableProducts.map((p, index) => ({
      id: p.id!,
      sort_order: index,
    }));
    
    const res = await api.updateProductOrder(productsWithOrder);
    if (res.data) {
      toast.success('Product order saved');
      setIsReordering(false);
      load();
    } else {
      toast.error(res.error || 'Failed to save order');
    }
  };

  return (
    <div className="overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Products</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant={isReordering ? "default" : "outline"} 
            className="rounded-full text-xs sm:text-sm" 
            onClick={() => setIsReordering(!isReordering)}
          >
            <GripVertical className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> 
            {isReordering ? 'Done' : 'Reorder'}
          </Button>
          {isReordering && (
            <Button className="rounded-full bg-green-600 hover:bg-green-700 text-xs sm:text-sm" onClick={saveProductOrder}>
              <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Save Order
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs sm:text-sm" onClick={() => setEditing({ ...emptyProduct })}>
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent disableOutsideClick className="max-w-[425px] sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{editing?.id ? 'Edit Product' : 'Add Product'}</DialogTitle>
              </DialogHeader>
              {editing && (
                <div className="space-y-3">
                  <div><Label>Name</Label><Input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                  <div>
                    <Label>Description</Label>
                    <ReactQuill
                      theme="snow"
                      value={editing.description || ''}
                      onChange={(value) => setEditing({ ...editing, description: value })}
                      modules={quillModules}
                      formats={quillFormats}
                      className="bg-background rounded-md [&_.ql-toolbar]:border-border [&_.ql-container]:border-border [&_.ql-editor]:min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Price (PKR)</Label><Input type="number" step="1" value={editing.price || 0} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) })} /></div>
                    <div><Label>Discount Price (PKR)</Label><Input type="number" step="1" value={editing.discount_price || 0} onChange={(e) => setEditing({ ...editing, discount_price: parseFloat(e.target.value) })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Stock</Label><Input type="number" value={editing.stock || 0} onChange={(e) => setEditing({ ...editing, stock: parseInt(e.target.value) })} /></div>
                    <div>
                      <Label>Category</Label>
                      <select
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        value={editing.category || ''}
                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                      >
                        <option value="">Select category</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>Product Images (Max 5)</Label>
                    <div className="space-y-2">
                      {previewUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative inline-block">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="h-16 w-16 sm:h-24 sm:w-24 rounded-lg object-cover border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 hover:bg-destructive/80"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="image-upload"
                          multiple
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <span className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors">
                            <Upload className="h-4 w-4" /> Choose Images
                          </span>
                        </label>
                        {selectedFiles.length > 0 && (
                          <Button
                            type="button"
                            onClick={handleUpload}
                            disabled={uploading}
                            size="sm"
                            className="bg-primary text-primary-foreground"
                          >
                            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image(s)`}
                          </Button>
                        )}
                        {previewUrls.length > 0 && (
                          <Button
                            type="button"
                            onClick={clearAllImages}
                            variant="outline"
                            size="sm"
                          >
                            Clear All
                          </Button>
                        )}
                      </div>

                      <Input
                        value={(editing.image_urls || []).join(', ')}
                        onChange={(e) => {
                          const urls = e.target.value.split(',').map(url => url.trim()).filter(url => url);
                          setEditing({ ...editing, image_urls: urls });
                        }}
                        placeholder="Or enter image URLs (comma separated)"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                    <Label>Active</Label>
                  </div>
                  <Button className="w-full rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTab === 'active' ? 'default' : 'outline'}
          onClick={() => setActiveTab('active')}
          className="rounded-full text-xs sm:text-sm"
        >
          Active ({activeProducts.length})
        </Button>
        <Button
          variant={activeTab === 'inactive' ? 'default' : 'outline'}
          onClick={() => setActiveTab('inactive')}
          className="rounded-full text-xs sm:text-sm"
        >
          Inactive ({inactiveProducts.length})
        </Button>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2 sm:p-3 font-medium">Product</th>
              <th className="text-left p-2 sm:p-3 font-medium hidden md:table-cell">Category</th>
              <th className="text-right p-2 sm:p-3 font-medium">Price (PKR)</th>
              <th className="text-right p-2 sm:p-3 font-medium hidden sm:table-cell">Stock</th>
              <th className="text-right p-2 sm:p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((p, index) => (
              <tr 
                key={p.id} 
                className={`border-t ${isReordering ? 'cursor-move' : ''} ${draggedItem === index ? 'opacity-50 bg-muted' : ''}`}
                draggable={isReordering}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <td className="p-2 sm:p-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {Array.isArray(p.image_urls) && p.image_urls.length > 0 && (
                      <div className="flex -space-x-2">
                        {p.image_urls.slice(0, 3).map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`${p.name} ${idx + 1}`}
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover border-2 border-background"
                          />
                        ))}
                        {p.image_urls.length > 3 && (
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                            +{p.image_urls.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm truncate max-w-[120px] sm:max-w-none">{p.name}</p>
                    </div>
                  </div>
                </td>
                <td className="p-2 sm:p-3 hidden md:table-cell text-muted-foreground">{p.category}</td>
                <td className="p-2 sm:p-3 text-right font-medium text-sm">
                  {p.discount_price && Number(p.discount_price) > 0 ? (
                    <div className="flex flex-col items-end">
                      <span className="text-green-600">Rs. {Number(p.discount_price).toFixed(0)}</span>
                      <span className="text-muted-foreground line-through text-xs">Rs. {Number(p.price).toFixed(0)}</span>
                    </div>
                  ) : (
                    <span>Rs. {Number(p.price).toFixed(0)}</span>
                  )}
                </td>
                <td className="p-2 sm:p-3 text-right hidden sm:table-cell">{p.stock}</td>
                <td className="p-2 sm:p-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing({ ...p }); setOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(p.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {currentProducts.length === 0 && (
              <tr><td colSpan={5} className="p-4 sm:p-8 text-center text-muted-foreground">
                {activeTab === 'active' ? 'No active products yet.' : 'No inactive products.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent className="flex-wrap justify-center">
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink 
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)} 
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

export default AdminProducts;

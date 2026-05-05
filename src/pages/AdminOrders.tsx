import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Image } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  shipping_country: string;
  total: number;
  status: string;
  created_at: string;
  payment_screenshot?: string | null;
  payment_method?: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

const statuses = ['pending','confirmed', 'shipped', 'delivered'];

const ITEMS_PER_PAGE = 10;

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [selected, setSelected] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const load = async () => {
    const ordersRes = await api.getOrders();
    if (ordersRes.data) {
      setOrders(ordersRes.data);
    } else {
      toast.error(ordersRes.error || 'Failed to load orders');
    }

    // Load all order items for summary display
    const itemsRes = await api.getOrderItems();
    if (itemsRes.data) {
      const grouped: Record<string, OrderItem[]> = {};
      itemsRes.data.forEach((item) => {
        if (!grouped[item.order_id]) grouped[item.order_id] = [];
        grouped[item.order_id].push(item);
      });
      setOrderItems(grouped);
    } else {
      toast.error(itemsRes.error || 'Failed to load order items');
    }
  };

useEffect(() => { load(); }, []);

  // Reset to page 1 when orders change
  useEffect(() => {
    setCurrentPage(1);
  }, [orders.length]);

  const updateStatus = async (id: string, status: string) => {
    const res = await api.updateOrder(id, { status });
    if (res.data) {
      toast.success('Status updated');
      load();
    } else {
      toast.error(res.error || 'Failed to update status');
    }
  };

const viewOrder = async (order: Order) => {
    setSelected(order);
    setItems(orderItems[order.id] || []);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="overflow-x-hidden">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Orders</h1>

      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Order</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Customer</th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">Products</th>
              <th className="text-right p-3 font-medium">Total</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((o) => (
              <tr key={o.id} className="border-t cursor-pointer hover:bg-muted/30" onClick={() => viewOrder(o)}>
                <td className="p-3 font-mono text-xs font-bold">{o.order_number}</td>
                <td className="p-3 hidden md:table-cell">{o.customer_name}</td>
                <td className="p-3 hidden lg:table-cell">
                  <div className="space-y-0.5">
                    {(orderItems[o.id] || []).map((it) => (
                      <p key={it.id} className="text-xs text-muted-foreground">
                        {it.product_name} <span className="font-medium text-foreground">×{it.quantity}</span>
                      </p>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-right font-medium">Rs. {Number(o.total).toFixed(0)}</td>
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                    <SelectTrigger className="h-8 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3 text-right text-muted-foreground text-xs hidden sm:table-cell">
                  {new Date(o.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders yet</td></tr>
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

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Order {selected?.order_number}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-muted-foreground">Customer</p><p className="font-medium">{selected.customer_name}</p></div>
                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{selected.customer_email}</p></div>
                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selected.customer_phone}</p></div>
                <div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{selected.status}</p></div>
              </div>
              <div>
                <p className="text-muted-foreground">Shipping</p>
                <p className="font-medium">{selected.shipping_address}, {selected.shipping_city}, {selected.shipping_zip}, {selected.shipping_country}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-2">Items</p>
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between py-1">
                    <span>{it.product_name} × {it.quantity}</span>
                    <span className="font-medium">Rs. {(Number(it.price) * it.quantity).toFixed(0)}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span >Rs. {Number(selected.total).toFixed(0)}</span>
                </div>
              </div>
              {selected.payment_screenshot && (
                <div>
                  <p className="text-muted-foreground mb-2">Payment Screenshot</p>
                  <a 
                    href={selected.payment_screenshot} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block rounded-lg border overflow-hidden hover:border-primary/40 transition-colors"
                  >
                    <img 
                      src={selected.payment_screenshot} 
                      alt="Payment Screenshot" 
                      className="w-full h-auto max-h-64 object-contain bg-muted"
                    />
                  </a>
                  <p className="text-xs text-muted-foreground mt-1">Click to view full size</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;

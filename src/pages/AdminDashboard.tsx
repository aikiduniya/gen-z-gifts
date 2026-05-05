import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [ordersRes, productsRes, orderItemsRes] = await Promise.all([
        api.getOrders(),
        api.getProducts(),
        api.getOrderItems(),
      ]);
      const orders = ordersRes.data || [];
      const products = productsRes.data || [];
      const orderItems = orderItemsRes.data || [];
      const revenue = orders.reduce((s, o) => s + Number(o.total), 0);
      setStats({ revenue, orders: orders.length, products: products.length });
      setRecentOrders(orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));

      // Process revenue by month
      const revenueByMonth: Record<string, number> = {};
      orders.forEach((order: any) => {
        const date = new Date(order.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + Number(order.total);
      });
      const sortedMonths = Object.keys(revenueByMonth).sort();
      setRevenueData(sortedMonths.map(month => ({
        month,
        revenue: revenueByMonth[month],
      })));

      // Process orders by status
      const statusCount: Record<string, number> = { pending: 0, shipped: 0, delivered: 0 };
      orders.forEach((order: any) => {
        const status = order.status || 'pending';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      setOrdersByStatus([
        { status: 'Pending', count: statusCount.pending || 0 },
        { status: 'Shipped', count: statusCount.shipped || 0 },
        { status: 'Delivered', count: statusCount.delivered || 0 },
      ]);

      // Process top products by order count
      const productCount: Record<string, number> = {};
      orderItems.forEach((item: any) => {
        const productId = item.product_id;
        productCount[productId] = (productCount[productId] || 0) + item.quantity;
      });
      const productMap: Record<string, string> = {};
      products.forEach((p: any) => { productMap[p.id] = p.name; });
      const topProductsList = Object.entries(productCount)
        .map(([id, count]) => ({ name: productMap[id] || `Product ${id}`, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopProducts(topProductsList);
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: `Rs. ${stats.revenue.toFixed(0)}`, icon: DollarSign, color: 'text-green-500' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'text-primary' },
    { label: 'Total Products', value: stats.products, icon: Package, color: 'text-accent' },
    { label: 'Avg. Order', value: `Rs. ${stats.orders ? (stats.revenue / stats.orders).toFixed(0) : '0'}`, icon: TrendingUp, color: 'text-orange-500' },
  ];

  return (
    <div className="overflow-x-hidden">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
        {statCards.map((s) => (
          <Card key={s.label} className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-3 w-3 md:h-4 md:w-4 ${s.color}`} />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <p className="text-lg md:text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-8">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-base md:text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            {revenueData.length === 0 ? (
              <p className="text-muted-foreground text-sm">No revenue data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status Chart */}
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-base md:text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            {ordersByStatus.length === 0 ? (
              <p className="text-muted-foreground text-sm">No orders yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ordersByStatus}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="status" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products Chart */}
      <Card className="mb-4 md:mb-8">
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-base md:text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Top Products</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          {topProducts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No product data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" width={80} className="text-xs" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  formatter={(value: number) => [value, 'Orders']}
                />
                <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-base md:text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet</p>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">Rs. {Number(o.total).toFixed(0)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      o.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

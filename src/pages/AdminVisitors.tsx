import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Globe, MapPin, Eye, TrendingUp, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Visitor {
  id: string;
  page_url: string;
  referrer: string;
  country: string;
  city: string;
  user_agent: string;
  session_id: string;
  created_at: string;
}

const COLORS = ['hsl(270, 70%, 55%)', 'hsl(330, 70%, 60%)', '#f97316', '#22c55e', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6'];

const AdminVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await api.getVisitors(dateRange);
      setVisitors(data || []);
      setLoading(false);
    };
    load();
  }, [dateRange]);

  // Stats
  const totalViews = visitors.length;
  const uniqueSessions = new Set(visitors.map(v => v.session_id)).size;
  const uniqueCountries = new Set(visitors.filter(v => v.country).map(v => v.country)).size;
  const todayViews = visitors.filter(v => {
    const d = new Date(v.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  // Country breakdown
  const countryMap: Record<string, number> = {};
  visitors.forEach(v => {
    if (v.country) countryMap[v.country] = (countryMap[v.country] || 0) + 1;
  });
  const countryData = Object.entries(countryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // City breakdown
  const cityMap: Record<string, number> = {};
  visitors.forEach(v => {
    if (v.city) cityMap[v.city] = (cityMap[v.city] || 0) + 1;
  });
  const cityData = Object.entries(cityMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Page breakdown
  const pageMap: Record<string, number> = {};
  visitors.forEach(v => {
    pageMap[v.page_url] = (pageMap[v.page_url] || 0) + 1;
  });
  const pageData = Object.entries(pageMap)
    .map(([page, count]) => ({ page: page || '/', count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Daily views chart
  const dailyMap: Record<string, number> = {};
  visitors.forEach(v => {
    const day = new Date(v.created_at).toISOString().split('T')[0];
    dailyMap[day] = (dailyMap[day] || 0) + 1;
  });
  const dailyData = Object.entries(dailyMap)
    .map(([date, views]) => ({ date, views }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Referrer breakdown
  const refMap: Record<string, number> = {};
  visitors.forEach(v => {
    let source = 'Direct';
    if (v.referrer) {
      try {
        source = new URL(v.referrer).hostname;
      } catch {
        source = v.referrer;
      }
    }
    refMap[source] = (refMap[source] || 0) + 1;
  });
  const referrerData = Object.entries(refMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const statCards = [
    { label: 'Total Page Views', value: totalViews, icon: Eye, color: 'text-primary' },
    { label: 'Unique Visitors', value: uniqueSessions, icon: Users, color: 'text-accent' },
    { label: 'Countries', value: uniqueCountries, icon: Globe, color: 'text-green-500' },
    { label: 'Today\'s Views', value: todayViews, icon: TrendingUp, color: 'text-orange-500' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <div className="overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3">
        <h1 className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Visitor Analytics
        </h1>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['7d', '30d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                dateRange === range ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
        {statCards.map(s => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-4">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-3 w-3 md:h-4 md:w-4 ${s.color}`} />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <p className="text-lg md:text-2xl font-bold">{s.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily Views Chart */}
      <Card className="mb-4 md:mb-6">
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-base md:text-lg flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <Calendar className="h-4 w-4" /> Daily Page Views
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          {dailyData.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tickFormatter={d => d.slice(5)} />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="views" stroke="hsl(270, 70%, 55%)" strokeWidth={2} dot={{ fill: 'hsl(270, 70%, 55%)' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Country Pie Chart */}
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <Globe className="h-4 w-4" /> Visitors by Country
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            {countryData.length === 0 ? (
              <p className="text-muted-foreground text-sm">No location data yet</p>
            ) : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={countryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {countryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {countryData.map((c, i) => (
                    <span key={c.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {c.name}: {c.value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <TrendingUp className="h-4 w-4" /> Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            {referrerData.length === 0 ? (
              <p className="text-muted-foreground text-sm">No referrer data yet</p>
            ) : (
              <div className="space-y-2">
                {referrerData.map((r, i) => (
                  <div key={r.name} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate max-w-[180px]">{r.name}</span>
                        <span className="text-xs text-muted-foreground">{r.value} visits</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(r.value / referrerData[0].value) * 100}%`,
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Top Cities */}
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <MapPin className="h-4 w-4" /> Top Cities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            {cityData.length === 0 ? (
              <p className="text-muted-foreground text-sm">No city data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={cityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={60} />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="hsl(330, 70%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-base md:text-lg flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <Eye className="h-4 w-4" /> Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            {pageData.length === 0 ? (
              <p className="text-muted-foreground text-sm">No page data yet</p>
            ) : (
              <div className="space-y-2">
                {pageData.map((p, i) => (
                  <div key={p.page} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium truncate max-w-[200px]">{p.page}</span>
                    <span className="text-sm font-bold text-primary">{p.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminVisitors;

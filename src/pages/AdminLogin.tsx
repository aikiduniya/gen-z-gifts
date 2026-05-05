import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import logo from '@/assets/genzgifts-logo.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.login(email, password);
      if (response.error) throw new Error(response.error);

      const { user, isAdmin, session } = response.data!;
      if (!isAdmin) {
        toast.error('Access denied. Admin only.');
        return;
      }

      localStorage.setItem('access_token', session.access_token);

      toast.success('Welcome back!');
      navigate('/admin');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-secondary/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      <div className="w-full max-w-md mx-4 relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-5">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent blur-xl opacity-40 scale-110" />
            <img
              src={logo}
              alt="GenZGifts"
              className="relative h-20 w-20 rounded-2xl mx-auto object-cover ring-2 ring-border shadow-2xl"
            />
          </div>
          <h1
            className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Sign in to manage your store
            <Sparkles className="h-3.5 w-3.5 text-accent" />
          </p>
        </div>

        {/* Login Card */}
        <div className="relative">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 blur-sm" />
          <form
            onSubmit={handleLogin}
            className="relative space-y-5 bg-card/80 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-border/50 shadow-2xl"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@genzgifts.com"
                  className="pl-10 h-12 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-12 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground font-semibold text-sm tracking-wide shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </Button>

            <div className="pt-2 text-center">
              <p className="text-xs text-muted-foreground">
                Protected area · Admin access only
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

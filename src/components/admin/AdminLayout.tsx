import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { useAdmin } from '@/hooks/useAdmin';
import AdminSidebar from './AdminSidebar';
import { Loader2, Menu, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <header className="md:hidden flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-popover">
        <span className="flex items-center gap-2 font-semibold"><Shield className="size-5 text-primary" />Admin Panel</span>
        <Button variant="outline" size="icon" aria-label={menuOpen ? 'Close admin menu' : 'Open admin menu'} aria-expanded={menuOpen} aria-controls="admin-navigation" onClick={() => setMenuOpen(open => !open)}>
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </header>
      <div id="admin-navigation" className={menuOpen ? 'block md:block md:shrink-0' : 'hidden md:block md:shrink-0'}>
        <AdminSidebar onNavigate={() => setMenuOpen(false)} />
      </div>
      <main className="flex-1 min-w-0 w-full overflow-x-auto">
        <div className="p-4 md:p-6 min-w-0">{children}</div>
      </main>
    </div>
  );
}

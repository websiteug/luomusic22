import { NavLink, useNavigate } from '@/lib/router-compat';
import {
  Users,
  Music,
  Video,
  Image,
  CreditCard,
  Settings,
  Home,
  Mic2,
  MessageSquare,
  Tag,
  Shield,
  LogOut,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/admin', icon: Home, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/activities', icon: Activity, label: 'User Activities' },
  { to: '/admin/artists', icon: Mic2, label: 'Artists' },
  { to: '/admin/music', icon: Music, label: 'Music' },
  { to: '/admin/videos', icon: Video, label: 'Videos' },
  { to: '/admin/hero-slides', icon: Image, label: 'Hero Slides' },
  { to: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { to: '/admin/genres', icon: Tag, label: 'Genres' },
  { to: '/admin/guide', icon: MessageSquare, label: 'GUIDE' },
];

export default function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  return (
    <aside className="w-full md:w-64 bg-card md:border-r border-b md:border-b-0 border-border md:min-h-screen flex flex-col">
      <div className="hidden md:block p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">VYBE Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 md:p-4 grid grid-cols-2 gap-1 md:block md:space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 rounded-lg text-sm font-medium transition-colors min-w-0',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-glass hover:text-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="break-words">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => navigate('/')}
        >
          <Home className="w-5 h-5" />
          Back to Site
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

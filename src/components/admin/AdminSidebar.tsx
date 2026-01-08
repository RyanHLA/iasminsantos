import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Images, Sparkles, User, Settings, LogOut, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'gallery', label: 'Portfólio', icon: Images },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'hero', label: 'Hero', icon: Sparkles },
  { id: 'about', label: 'Sobre', icon: User },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

const AdminSidebar = ({ activeTab, onTabChange, onSignOut }: AdminSidebarProps) => {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/30 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border/30 px-6">
        <h1 className="font-serif text-xl text-slate-800">Iasmin Santos</h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-amber-50 text-amber-800'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive ? 'text-amber-700' : 'text-slate-400')} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border/30 p-4">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

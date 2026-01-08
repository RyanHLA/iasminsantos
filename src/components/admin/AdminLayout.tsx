import { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: string;
  pageTitle: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
}

const AdminLayout = ({ children, activeTab, pageTitle, onTabChange, onSignOut }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
        onSignOut={onSignOut} 
      />

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/30 bg-white/80 px-8 backdrop-blur-sm">
          <h2 className="font-serif text-2xl text-slate-800">{pageTitle}</h2>
          
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-amber-700 hover:shadow-md"
            >
              Ver site
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

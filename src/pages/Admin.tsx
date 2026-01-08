import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminGalleryNew from '@/components/admin/AdminGalleryNew';
import AdminClientAlbums from '@/components/admin/AdminClientAlbums';
import AdminHero from '@/components/admin/AdminHero';
import AdminAbout from '@/components/admin/AdminAbout';
import AdminSettings from '@/components/admin/AdminSettings';

const Admin = () => {
  const { isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/auth');
    }
  }, [isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-pulse text-slate-400">Carregando...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'gallery': return 'Portfólio';
      case 'clients': return 'Clientes';
      case 'hero': return 'Hero';
      case 'about': return 'Sobre';
      case 'settings': return 'Configurações';
      default: return 'Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'gallery':
        return <AdminGalleryNew />;
      case 'clients':
        return <AdminClientAlbums />;
      case 'hero':
        return <AdminHero />;
      case 'about':
        return <AdminAbout />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      pageTitle={getPageTitle()}
      onTabChange={setActiveTab}
      onSignOut={handleSignOut}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default Admin;

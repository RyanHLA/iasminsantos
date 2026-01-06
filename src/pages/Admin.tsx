import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Image, Home, User, Grid } from 'lucide-react';
import AdminGallery from '@/components/admin/AdminGallery';
import AdminHero from '@/components/admin/AdminHero';
import AdminAbout from '@/components/admin/AdminAbout';

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('gallery');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-serif text-2xl text-foreground">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">Gerencie suas fotos</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-gold"
            >
              Ver site →
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-border/50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted/50">
            <TabsTrigger value="gallery" className="data-[state=active]:bg-gold data-[state=active]:text-soft-black">
              <Grid className="mr-2 h-4 w-4" />
              Galeria
            </TabsTrigger>
            <TabsTrigger value="hero" className="data-[state=active]:bg-gold data-[state=active]:text-soft-black">
              <Home className="mr-2 h-4 w-4" />
              Hero
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-gold data-[state=active]:text-soft-black">
              <User className="mr-2 h-4 w-4" />
              Sobre
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-6">
            <AdminGallery />
          </TabsContent>

          <TabsContent value="hero" className="space-y-6">
            <AdminHero />
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <AdminAbout />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;

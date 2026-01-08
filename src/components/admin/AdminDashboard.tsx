import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Images, FolderOpen, Eye, TrendingUp } from 'lucide-react';

interface Stats {
  totalAlbums: number;
  totalPhotos: number;
  publishedAlbums: number;
  categories: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalAlbums: 0,
    totalPhotos: 0,
    publishedAlbums: 0,
    categories: 6,
  });
  const [recentAlbums, setRecentAlbums] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch albums
      const { data: albums } = await supabase.from('albums').select('*');
      
      // Fetch photos
      const { data: photos } = await supabase.from('site_images').select('id');
      
      if (albums) {
        setStats({
          totalAlbums: albums.length,
          totalPhotos: photos?.length || 0,
          publishedAlbums: albums.filter(a => a.status === 'published').length,
          categories: 6,
        });
        setRecentAlbums(albums.slice(0, 5));
      }
    };
    
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total de Álbuns',
      value: stats.totalAlbums,
      icon: FolderOpen,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Total de Fotos',
      value: stats.totalPhotos,
      icon: Images,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Álbuns Publicados',
      value: stats.publishedAlbums,
      icon: Eye,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Categorias',
      value: stats.categories,
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="font-serif text-2xl text-slate-800">Bem-vinda de volta!</h2>
        <p className="mt-1 text-slate-500">Aqui está um resumo do seu portfólio.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <p className="mt-2 font-serif text-3xl text-slate-800">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Albums */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="font-serif text-lg text-slate-800">Álbuns Recentes</h3>
        
        {recentAlbums.length === 0 ? (
          <p className="mt-4 text-slate-500">Nenhum álbum criado ainda.</p>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {recentAlbums.map((album) => (
              <div key={album.id} className="flex items-center gap-4 py-3">
                <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
                  {album.cover_image_url ? (
                    <img
                      src={album.cover_image_url}
                      alt={album.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FolderOpen className="h-5 w-5 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-700">{album.title}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(album.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    album.status === 'published'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {album.status === 'published' ? 'Publicado' : 'Rascunho'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

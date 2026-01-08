import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Check, Camera, ArrowLeft, Send, Loader2, CheckCircle2, Image as ImageIcon, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Album {
  id: string;
  title: string;
  cover_image_url: string | null;
  client_enabled: boolean;
  selection_limit: number | null;
  client_submitted_at: string | null;
  category: string;
}

interface Photo {
  id: string;
  image_url: string;
  title: string | null;
}

const ClientProof = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Auth state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Album data
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  
  // UI state
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Check if album exists and is client-enabled
  useEffect(() => {
    const fetchAlbum = async () => {
      if (!albumId) return;
      
      // Explicitly select only non-sensitive columns (never fetch client_pin)
      const { data, error } = await supabase
        .from('albums')
        .select('id, title, cover_image_url, client_enabled, selection_limit, client_submitted_at, category')
        .eq('id', albumId)
        .eq('client_enabled', true)
        .maybeSingle();
      
      if (error || !data) {
        navigate('/not-found');
        return;
      }
      
      setAlbum(data as Album);
      setIsSubmitted(!!data.client_submitted_at);
      setLoading(false);
    };
    
    fetchAlbum();
  }, [albumId, navigate]);

  // Fetch photos after unlock
  useEffect(() => {
    if (!isUnlocked || !albumId) return;
    
    const fetchPhotos = async () => {
      const { data } = await supabase
        .from('site_images')
        .select('id, image_url, title')
        .eq('album_id', albumId)
        .order('display_order');
      
      setPhotos((data || []) as Photo[]);
    };
    
    const fetchSelections = async () => {
      const { data } = await supabase
        .from('client_selections')
        .select('image_id')
        .eq('album_id', albumId);
      
      if (data) {
        setSelectedPhotos(new Set(data.map(s => s.image_id)));
      }
    };
    
    fetchPhotos();
    fetchSelections();
  }, [isUnlocked, albumId]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    
    if (!album || !albumId) return;
    
    // Server-side PIN verification - never expose the actual PIN to client
    const { data: isValid, error } = await supabase.rpc('verify_album_pin', {
      album_uuid: albumId,
      pin_attempt: pin
    });
    
    if (error) {
      setPinError('Erro ao verificar PIN. Tente novamente.');
      setPin('');
      return;
    }
    
    if (isValid) {
      setIsUnlocked(true);
    } else {
      setPinError('PIN incorreto. Tente novamente.');
      setPin('');
    }
  };

  const togglePhotoSelection = async (photoId: string) => {
    if (isSubmitted || !albumId) return;
    
    const isSelected = selectedPhotos.has(photoId);
    
    // Check limit
    if (!isSelected && album?.selection_limit && selectedPhotos.size >= album.selection_limit) {
      toast({
        title: 'Limite atingido',
        description: `Você pode selecionar no máximo ${album.selection_limit} fotos.`,
        variant: 'destructive',
      });
      return;
    }
    
    // Optimistic update
    const newSelected = new Set(selectedPhotos);
    if (isSelected) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
    
    // Database update
    if (isSelected) {
      await supabase
        .from('client_selections')
        .delete()
        .eq('album_id', albumId)
        .eq('image_id', photoId);
    } else {
      await supabase
        .from('client_selections')
        .insert({ album_id: albumId, image_id: photoId });
    }
  };

  const handleSubmit = async () => {
    if (!albumId || selectedPhotos.size === 0) {
      toast({
        title: 'Selecione fotos',
        description: 'Por favor, selecione pelo menos uma foto antes de enviar.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('albums')
      .update({ client_submitted_at: new Date().toISOString() })
      .eq('id', albumId);
    
    if (error) {
      toast({
        title: 'Erro ao enviar',
        description: 'Ocorreu um erro ao enviar sua seleção. Tente novamente.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    toast({
      title: 'Seleção enviada!',
      description: 'Suas fotos favoritas foram enviadas com sucesso.',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (!album) {
    return null;
  }

  // PIN Gate Screen
  if (!isUnlocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-md">
          {/* Logo/Branding */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <Camera className="h-7 w-7 text-white/60" />
            </div>
            <h1 className="font-serif text-2xl text-white">{album.title}</h1>
            <p className="mt-2 text-sm text-white/50">Área de seleção do cliente</p>
          </div>
          
          {/* PIN Form */}
          <form onSubmit={handlePinSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="h-5 w-5 text-white/30" />
              </div>
              <Input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Digite o PIN de acesso"
                className="h-14 w-full rounded-xl border-white/10 bg-white/5 pl-12 text-center text-lg tracking-[0.5em] text-white placeholder:tracking-normal placeholder:text-white/30 focus:border-white/30 focus:ring-0"
                autoFocus
              />
            </div>
            
            {pinError && (
              <p className="text-center text-sm text-red-400">{pinError}</p>
            )}
            
            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-white text-slate-900 hover:bg-white/90"
              disabled={!pin}
            >
              Acessar Álbum
            </Button>
          </form>
          
          <p className="mt-8 text-center text-xs text-white/30">
            O PIN foi enviado pelo fotógrafo
          </p>
        </div>
      </div>
    );
  }

  // Submitted Confirmation Screen
  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="font-serif text-2xl text-white">Seleção Enviada!</h1>
          <p className="mt-4 text-white/60">
            Suas {selectedPhotos.size} fotos favoritas foram enviadas com sucesso para o fotógrafo.
          </p>
          <p className="mt-2 text-sm text-white/40">
            Você receberá uma notificação quando as fotos estiverem prontas.
          </p>
          
          <div className="mt-8 rounded-xl bg-white/5 p-6">
            <p className="text-sm text-white/50">Álbum</p>
            <p className="mt-1 font-serif text-lg text-white">{album.title}</p>
            <p className="mt-4 text-sm text-white/50">Fotos selecionadas</p>
            <p className="mt-1 text-3xl font-light text-white">{selectedPhotos.size}</p>
          </div>
        </div>
      </div>
    );
  }

  // Main Gallery View
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="font-serif text-lg text-white">{album.title}</h1>
            <p className="text-xs text-white/50">Selecione suas fotos favoritas</p>
          </div>
          <div className="flex items-center gap-4">
            {album.selection_limit && (
              <span className="text-sm text-white/60">
                {selectedPhotos.size}/{album.selection_limit}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Photo Grid */}
      <main className="mx-auto max-w-7xl px-4 py-8 pb-28">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ImageIcon className="mb-4 h-12 w-12 text-white/20" />
            <p className="text-white/50">Nenhuma foto disponível neste álbum.</p>
          </div>
        ) : (
          <>
            {showFavoritesOnly && selectedPhotos.size === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Heart className="mb-4 h-12 w-12 text-white/20" />
                <p className="text-white/50">Nenhuma foto selecionada ainda.</p>
                <Button
                  variant="ghost"
                  onClick={() => setShowFavoritesOnly(false)}
                  className="mt-4 text-white/60 hover:text-white"
                >
                  Ver todas as fotos
                </Button>
              </div>
            ) : (
              <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
                {photos
                  .filter(photo => !showFavoritesOnly || selectedPhotos.has(photo.id))
                  .map((photo) => {
                    const isSelected = selectedPhotos.has(photo.id);
                    return (
                      <div
                        key={photo.id}
                        className="group relative mb-3 break-inside-avoid cursor-pointer overflow-hidden rounded-lg"
                        onClick={() => togglePhotoSelection(photo.id)}
                      >
                        <img
                          src={photo.image_url}
                          alt={photo.title || ''}
                          className="w-full transition-transform duration-300 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                        
                        {/* Selection Overlay */}
                        <div
                          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
                            isSelected
                              ? 'bg-emerald-500/20'
                              : 'bg-black/0 group-hover:bg-black/30'
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                              isSelected
                                ? 'border-emerald-400 bg-emerald-500 scale-100'
                                : 'border-white/50 bg-white/10 scale-0 group-hover:scale-100'
                            }`}
                          >
                            <Check
                              className={`h-5 w-5 transition-all ${
                                isSelected ? 'text-white' : 'text-white/70'
                              }`}
                            />
                          </div>
                        </div>
                        
                        {/* Selected Border */}
                        {isSelected && (
                          <div className="absolute inset-0 rounded-lg ring-2 ring-emerald-400 ring-inset" />
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <p className="text-sm text-slate-600 whitespace-nowrap">
            <span className="text-lg font-semibold text-slate-900">{selectedPhotos.size}</span>
            {album.selection_limit ? ` / ${album.selection_limit}` : ''} fotos selecionadas
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`h-11 rounded-xl border-slate-200 px-4 text-sm ${
                showFavoritesOnly 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Heart className={`mr-2 h-4 w-4 ${showFavoritesOnly ? 'fill-emerald-500' : ''}`} />
              <span className="hidden sm:inline">Ver favoritas</span>
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedPhotos.size === 0 || isSubmitting}
              className="h-11 rounded-xl bg-emerald-500 px-6 text-white hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Finalizar Seleção
            </Button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0">
          {previewPhoto && (
            <img
              src={previewPhoto.image_url}
              alt={previewPhoto.title || ''}
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientProof;

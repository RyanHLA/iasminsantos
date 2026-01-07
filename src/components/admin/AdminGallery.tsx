import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Trash2, Edit, Upload, Loader2, Star, GripVertical, X, 
  ChevronRight, ArrowLeft, Calendar, Image, FolderOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

interface GalleryImage {
  id: string;
  category: string;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
  is_featured?: boolean;
  album_id?: string | null;
}

interface Album {
  id: string;
  category: string;
  title: string;
  event_date: string | null;
  status: 'draft' | 'published';
  cover_image_url: string | null;
  created_at: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  preview: string;
}

type NavigationLevel = 'categories' | 'albums' | 'photos';

const CATEGORIES = [
  { id: 'casamentos', label: 'Casamentos' },
  { id: 'gestantes', label: 'Gestantes' },
  { id: '15-anos', label: '15 Anos' },
  { id: 'pre-wedding', label: 'Pré-Wedding' },
  { id: 'externo', label: 'Externo' },
  { id: 'eventos', label: 'Eventos' },
];

// Sortable Image Card Component
const SortableImageCard = ({
  image,
  onEdit,
  onDelete,
  onToggleFeatured,
  isSelected,
  onSelect,
  onSetCover,
}: {
  image: GalleryImage;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: () => void;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onSetCover: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative overflow-hidden rounded-lg border bg-card transition-all ${
        isDragging ? 'shadow-xl border-gold' : 'border-border/50 hover:border-gold/50'
      } ${isSelected ? 'ring-2 ring-gold' : ''}`}
    >
      {/* Checkbox */}
      <div className="absolute left-2 top-2 z-10">
        <div className="rounded bg-background/80 p-1 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="border-border data-[state=checked]:bg-gold data-[state=checked]:border-gold"
          />
        </div>
      </div>

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute right-2 top-2 z-10 cursor-grab rounded bg-background/80 p-1.5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Featured Badge */}
      {image.is_featured && (
        <div className="absolute left-2 top-10 z-10">
          <div className="rounded bg-gold px-2 py-0.5 text-xs font-medium text-soft-black">
            Destaque
          </div>
        </div>
      )}

      {/* Image */}
      <div className="aspect-[3/4]">
        <img
          src={image.image_url}
          alt={image.title}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Hover Overlay with Actions */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-soft-black/60 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          size="icon"
          variant="secondary"
          onClick={onEdit}
          className="h-10 w-10 rounded-full bg-background/90 hover:bg-background"
          title="Editar"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={onSetCover}
          className="h-10 w-10 rounded-full bg-background/90 hover:bg-background"
          title="Definir como capa"
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={onToggleFeatured}
          className={`h-10 w-10 rounded-full ${
            image.is_featured 
              ? 'bg-gold text-soft-black hover:bg-gold-dark' 
              : 'bg-background/90 hover:bg-background'
          }`}
          title={image.is_featured ? 'Remover destaque' : 'Marcar como destaque'}
        >
          <Star className={`h-4 w-4 ${image.is_featured ? 'fill-current' : ''}`} />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          onClick={onDelete}
          className="h-10 w-10 rounded-full"
          title="Excluir"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Info Footer */}
      <div className="p-3">
        <p className="truncate font-medium text-foreground text-sm">
          {image.title || 'Sem título'}
        </p>
      </div>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({
  category,
  albumCount,
  coverImage,
  onClick,
}: {
  category: { id: string; label: string };
  albumCount: number;
  coverImage: string | null;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-gold/50 hover:shadow-xl"
  >
    <div className="aspect-[4/3] relative">
      {coverImage ? (
        <img
          src={coverImage}
          alt={category.label}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-muted/50 flex items-center justify-center">
          <FolderOpen className="h-16 w-16 text-muted-foreground/30" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-soft-black/80 via-transparent to-transparent" />
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-6">
      <h3 className="font-serif text-2xl text-white">{category.label}</h3>
      <p className="mt-1 text-sm text-white/70">{albumCount} {albumCount === 1 ? 'Álbum' : 'Álbuns'}</p>
    </div>
    <div className="absolute right-4 top-4 rounded-full bg-background/80 p-2 opacity-0 transition-opacity group-hover:opacity-100">
      <ChevronRight className="h-5 w-5 text-foreground" />
    </div>
  </div>
);

// Album Card Component
const AlbumCard = ({
  album,
  photoCount,
  onClick,
  onEdit,
  onDelete,
}: {
  album: Album;
  photoCount: number;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div
    className="group relative cursor-pointer overflow-hidden rounded-lg border border-border/50 bg-card transition-all hover:border-gold/50 hover:shadow-lg"
  >
    <div onClick={onClick} className="aspect-[3/4] relative">
      {album.cover_image_url ? (
        <img
          src={album.cover_image_url}
          alt={album.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-muted/30 flex items-center justify-center">
          <Image className="h-12 w-12 text-muted-foreground/30" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-soft-black/70 via-transparent to-transparent" />
    </div>
    
    {/* Status Badge */}
    <div className="absolute left-3 top-3">
      <Badge variant={album.status === 'published' ? 'default' : 'secondary'} className={album.status === 'published' ? 'bg-green-600' : ''}>
        {album.status === 'published' ? 'Publicado' : 'Rascunho'}
      </Badge>
    </div>
    
    {/* Action Buttons */}
    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <Button
        size="icon"
        variant="secondary"
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="h-8 w-8 rounded-full bg-background/80 hover:bg-background"
      >
        <Edit className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="icon"
        variant="destructive"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="h-8 w-8 rounded-full"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
    
    {/* Info Footer */}
    <div onClick={onClick} className="p-4">
      <h4 className="font-serif text-lg text-foreground truncate">{album.title}</h4>
      <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {album.event_date ? new Date(album.event_date).toLocaleDateString('pt-BR') : 'Sem data'}
        </span>
        <span>{photoCount} fotos</span>
      </div>
    </div>
  </div>
);

const AdminGallery = () => {
  // Navigation state
  const [currentLevel, setCurrentLevel] = useState<NavigationLevel>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  
  // Data state
  const [albums, setAlbums] = useState<Album[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [isAlbumDialogOpen, setIsAlbumDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  
  // Selection & upload state
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [albumFormData, setAlbumFormData] = useState({
    title: '',
    event_date: '',
    status: 'draft' as 'draft' | 'published',
  });
  const [photoFormData, setPhotoFormData] = useState({
    title: '',
    description: '',
  });

  const { toast } = useToast();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    if (selectedAlbum) {
      fetchPhotos(selectedAlbum.id);
    }
  }, [selectedAlbum]);

  const fetchAlbums = async () => {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Erro ao carregar álbuns', variant: 'destructive' });
    } else {
      setAlbums((data || []) as Album[]);
    }
    setLoading(false);
  };

  const fetchPhotos = async (albumId: string) => {
    const { data, error } = await supabase
      .from('site_images')
      .select('*')
      .eq('album_id', albumId)
      .order('display_order');

    if (error) {
      toast({ title: 'Erro ao carregar fotos', variant: 'destructive' });
    } else {
      setImages((data || []) as GalleryImage[]);
    }
  };

  const getAlbumCount = (categoryId: string) => 
    albums.filter(a => a.category === categoryId).length;

  const getPhotoCount = (albumId: string) => 
    images.filter(i => i.album_id === albumId).length;

  const getCategoryCover = (categoryId: string) => {
    const categoryAlbums = albums.filter(a => a.category === categoryId);
    return categoryAlbums.find(a => a.cover_image_url)?.cover_image_url || null;
  };

  // Navigation handlers
  const navigateToCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentLevel('albums');
  };

  const navigateToAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setCurrentLevel('photos');
  };

  const navigateBack = () => {
    if (currentLevel === 'photos') {
      setSelectedAlbum(null);
      setCurrentLevel('albums');
      setImages([]);
      setSelectedImages(new Set());
    } else if (currentLevel === 'albums') {
      setSelectedCategory(null);
      setCurrentLevel('categories');
    }
  };

  // Album CRUD
  const handleCreateAlbum = async () => {
    if (!selectedCategory || !albumFormData.title.trim()) return;

    const { error } = await supabase.from('albums').insert({
      category: selectedCategory,
      title: albumFormData.title,
      event_date: albumFormData.event_date || null,
      status: albumFormData.status,
    });

    if (error) {
      toast({ title: 'Erro ao criar álbum', variant: 'destructive' });
    } else {
      toast({ title: 'Álbum criado com sucesso!' });
      resetAlbumForm();
      fetchAlbums();
    }
  };

  const handleUpdateAlbum = async () => {
    if (!editingAlbum) return;

    const { error } = await supabase
      .from('albums')
      .update({
        title: albumFormData.title,
        event_date: albumFormData.event_date || null,
        status: albumFormData.status,
      })
      .eq('id', editingAlbum.id);

    if (error) {
      toast({ title: 'Erro ao atualizar álbum', variant: 'destructive' });
    } else {
      toast({ title: 'Álbum atualizado com sucesso!' });
      resetAlbumForm();
      fetchAlbums();
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!confirm('Tem certeza? Todas as fotos do álbum serão excluídas.')) return;

    const { error } = await supabase.from('albums').delete().eq('id', albumId);

    if (error) {
      toast({ title: 'Erro ao excluir álbum', variant: 'destructive' });
    } else {
      toast({ title: 'Álbum excluído!' });
      fetchAlbums();
    }
  };

  const openAlbumDialog = (album?: Album) => {
    if (album) {
      setEditingAlbum(album);
      setAlbumFormData({
        title: album.title,
        event_date: album.event_date || '',
        status: album.status,
      });
    } else {
      setEditingAlbum(null);
      setAlbumFormData({ title: '', event_date: '', status: 'draft' });
    }
    setIsAlbumDialogOpen(true);
  };

  const resetAlbumForm = () => {
    setAlbumFormData({ title: '', event_date: '', status: 'draft' });
    setEditingAlbum(null);
    setIsAlbumDialogOpen(false);
  };

  // Photo upload & CRUD
  const uploadImage = async (
    file: File,
    onProgress: (progress: number) => void
  ): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress = Math.min(currentProgress + 10, 90);
      onProgress(currentProgress);
    }, 100);

    const { error } = await supabase.storage
      .from('site-images')
      .upload(fileName, file);

    clearInterval(progressInterval);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    onProgress(100);

    const { data } = supabase.storage
      .from('site-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleFilesSelected = useCallback(async (files: FileList | File[]) => {
    if (!selectedAlbum) return;
    
    const fileArray = Array.from(files);
    
    const newUploads: UploadingFile[] = fileArray.map((file) => ({
      file,
      progress: 0,
      status: 'pending' as const,
      preview: URL.createObjectURL(file),
    }));

    setUploadingFiles((prev) => [...prev, ...newUploads]);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      setUploadingFiles((prev) =>
        prev.map((u) =>
          u.file === file ? { ...u, status: 'uploading' as const } : u
        )
      );

      const url = await uploadImage(file, (progress) => {
        setUploadingFiles((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, progress } : u
          )
        );
      });

      if (url) {
        await supabase.from('site_images').insert({
          section: 'gallery',
          category: selectedAlbum.category,
          album_id: selectedAlbum.id,
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: '',
          image_url: url,
          display_order: images.length + i,
        });

        setUploadingFiles((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, status: 'complete' as const } : u
          )
        );
      } else {
        setUploadingFiles((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, status: 'error' as const } : u
          )
        );
      }
    }

    setTimeout(() => {
      setUploadingFiles((prev) => prev.filter((u) => u.status !== 'complete'));
      fetchPhotos(selectedAlbum.id);
    }, 1500);

    toast({ title: `${fileArray.length} foto(s) enviada(s)!` });
  }, [selectedAlbum, images.length]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFilesSelected(files);
    }
  }, [handleFilesSelected]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      const newImages = arrayMove(images, oldIndex, newIndex);
      setImages(newImages);

      for (let i = 0; i < newImages.length; i++) {
        await supabase
          .from('site_images')
          .update({ display_order: i })
          .eq('id', newImages[i].id);
      }
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm('Excluir esta foto?')) return;

    const { error } = await supabase.from('site_images').delete().eq('id', id);

    if (error) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    } else {
      toast({ title: 'Foto excluída!' });
      setSelectedImages((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (selectedAlbum) fetchPhotos(selectedAlbum.id);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Excluir ${selectedImages.size} foto(s)?`)) return;

    for (const id of selectedImages) {
      await supabase.from('site_images').delete().eq('id', id);
    }

    toast({ title: `${selectedImages.size} foto(s) excluída(s)!` });
    setSelectedImages(new Set());
    if (selectedAlbum) fetchPhotos(selectedAlbum.id);
  };

  const handleToggleFeatured = async (image: GalleryImage) => {
    await supabase
      .from('site_images')
      .update({ is_featured: !image.is_featured } as any)
      .eq('id', image.id);

    if (selectedAlbum) fetchPhotos(selectedAlbum.id);
    toast({ title: image.is_featured ? 'Destaque removido' : 'Marcado como destaque!' });
  };

  const handleSetCover = async (image: GalleryImage) => {
    if (!selectedAlbum) return;

    await supabase
      .from('albums')
      .update({ cover_image_url: image.image_url })
      .eq('id', selectedAlbum.id);

    toast({ title: 'Capa do álbum atualizada!' });
    fetchAlbums();
  };

  const handleEditPhoto = (image: GalleryImage) => {
    setEditingImage(image);
    setPhotoFormData({ title: image.title, description: image.description });
    setIsPhotoDialogOpen(true);
  };

  const handleUpdatePhoto = async () => {
    if (!editingImage) return;

    const { error } = await supabase
      .from('site_images')
      .update({
        title: photoFormData.title,
        description: photoFormData.description,
      })
      .eq('id', editingImage.id);

    if (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } else {
      toast({ title: 'Foto atualizada!' });
      setIsPhotoDialogOpen(false);
      setEditingImage(null);
      if (selectedAlbum) fetchPhotos(selectedAlbum.id);
    }
  };

  const toggleImageSelection = (id: string, checked: boolean) => {
    setSelectedImages((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-gold" />
    </div>;
  }

  // Get current category label
  const currentCategoryLabel = selectedCategory 
    ? CATEGORIES.find(c => c.id === selectedCategory)?.label 
    : null;

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {currentLevel === 'categories' ? (
            <>
              <h2 className="font-serif text-2xl text-foreground">Portfólio</h2>
              <p className="text-sm text-muted-foreground">
                Gerencie seus álbuns por categoria
              </p>
            </>
          ) : (
            <div className="space-y-2">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      onClick={() => { setCurrentLevel('categories'); setSelectedCategory(null); setSelectedAlbum(null); }}
                      className="cursor-pointer hover:text-gold"
                    >
                      Portfólio
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {selectedCategory && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {currentLevel === 'albums' ? (
                          <BreadcrumbPage>{currentCategoryLabel}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink 
                            onClick={() => { setCurrentLevel('albums'); setSelectedAlbum(null); }}
                            className="cursor-pointer hover:text-gold"
                          >
                            {currentCategoryLabel}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </>
                  )}
                  {selectedAlbum && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{selectedAlbum.title}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={navigateBack}
                className="mt-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>
          )}
        </div>

        {/* Context Actions */}
        {currentLevel === 'albums' && selectedCategory && (
          <Button
            onClick={() => openAlbumDialog()}
            className="bg-gold text-soft-black hover:bg-gold-dark"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Ensaio
          </Button>
        )}
        {currentLevel === 'photos' && (
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gold text-soft-black hover:bg-gold-dark"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Fotos
          </Button>
        )}
      </div>

      {/* Level 1: Categories Dashboard */}
      {currentLevel === 'categories' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              albumCount={getAlbumCount(category.id)}
              coverImage={getCategoryCover(category.id)}
              onClick={() => navigateToCategory(category.id)}
            />
          ))}
        </div>
      )}

      {/* Level 2: Albums List */}
      {currentLevel === 'albums' && selectedCategory && (
        <>
          {albums.filter(a => a.category === selectedCategory).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="mb-4 h-16 w-16 text-muted-foreground/30" />
              <h3 className="font-serif text-xl text-foreground">Nenhum ensaio ainda</h3>
              <p className="mt-2 text-muted-foreground">
                Crie seu primeiro ensaio nesta categoria
              </p>
              <Button
                onClick={() => openAlbumDialog()}
                className="mt-6 bg-gold text-soft-black hover:bg-gold-dark"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Ensaio
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {albums
                .filter(a => a.category === selectedCategory)
                .map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    photoCount={getPhotoCount(album.id)}
                    onClick={() => navigateToAlbum(album)}
                    onEdit={() => openAlbumDialog(album)}
                    onDelete={() => handleDeleteAlbum(album.id)}
                  />
                ))}
            </div>
          )}
        </>
      )}

      {/* Level 3: Photo Editor */}
      {currentLevel === 'photos' && selectedAlbum && (
        <>
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
          />

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all ${
              isDragOver
                ? 'border-gold bg-gold/5'
                : 'border-border/50 hover:border-gold/50 hover:bg-muted/30'
            }`}
          >
            <Upload className={`mx-auto mb-3 h-10 w-10 ${isDragOver ? 'text-gold' : 'text-muted-foreground/50'}`} />
            <p className="font-medium text-foreground">
              Arraste suas fotos ou clique para selecionar
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Álbum: <span className="text-gold">{selectedAlbum.title}</span>
            </p>
          </div>

          {/* Upload Progress */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-3 rounded-lg border border-border/50 bg-card p-4">
              <p className="text-sm font-medium text-foreground">Enviando fotos...</p>
              {uploadingFiles.map((upload, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img
                    src={upload.preview}
                    alt=""
                    className="h-12 w-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm truncate text-foreground">{upload.file.name}</p>
                    <Progress value={upload.progress} className="mt-1 h-2" />
                  </div>
                  {upload.status === 'complete' && (
                    <span className="text-xs text-green-500">✓</span>
                  )}
                  {upload.status === 'error' && (
                    <span className="text-xs text-destructive">Erro</span>
                  )}
                  {upload.status === 'uploading' && (
                    <Loader2 className="h-4 w-4 animate-spin text-gold" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Images Grid with DnD */}
          {images.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {images.map((image) => (
                    <SortableImageCard
                      key={image.id}
                      image={image}
                      onEdit={() => handleEditPhoto(image)}
                      onDelete={() => handleDeletePhoto(image.id)}
                      onToggleFeatured={() => handleToggleFeatured(image)}
                      isSelected={selectedImages.has(image.id)}
                      onSelect={(checked) => toggleImageSelection(image.id, checked)}
                      onSetCover={() => handleSetCover(image)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma foto neste ensaio ainda
            </div>
          )}

          {/* Bulk Actions Bar */}
          {selectedImages.size > 0 && (
            <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fade-in-up">
              <div className="flex items-center gap-4 rounded-full border border-border/50 bg-card px-6 py-3 shadow-xl">
                <span className="text-sm font-medium text-foreground">
                  {selectedImages.size} foto(s)
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                  className="rounded-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedImages(new Set())}
                  className="rounded-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Album Dialog */}
      <Dialog open={isAlbumDialogOpen} onOpenChange={setIsAlbumDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAlbum ? 'Editar Ensaio' : 'Novo Ensaio'}
            </DialogTitle>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              editingAlbum ? handleUpdateAlbum() : handleCreateAlbum();
            }} 
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Título do Ensaio *</Label>
              <Input
                value={albumFormData.title}
                onChange={(e) => setAlbumFormData({ ...albumFormData, title: e.target.value })}
                placeholder="Ex: Mariana & João"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data do Evento</Label>
              <Input
                type="date"
                value={albumFormData.event_date}
                onChange={(e) => setAlbumFormData({ ...albumFormData, event_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={albumFormData.status}
                onValueChange={(value) => setAlbumFormData({ ...albumFormData, status: value as 'draft' | 'published' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Rascunhos não aparecem no site público
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetAlbumForm}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gold text-soft-black hover:bg-gold-dark"
              >
                {editingAlbum ? 'Salvar' : 'Criar Ensaio'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Photo Edit Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Foto</DialogTitle>
          </DialogHeader>
          {editingImage && (
            <form 
              onSubmit={(e) => { e.preventDefault(); handleUpdatePhoto(); }} 
              className="space-y-4"
            >
              <div className="overflow-hidden rounded-lg">
                <img
                  src={editingImage.image_url}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <Label>Texto Alternativo (SEO)</Label>
                <Input
                  value={photoFormData.title}
                  onChange={(e) => setPhotoFormData({ ...photoFormData, title: e.target.value })}
                  placeholder="Descreva a imagem"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={photoFormData.description}
                  onChange={(e) => setPhotoFormData({ ...photoFormData, description: e.target.value })}
                  placeholder="Descrição adicional"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPhotoDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gold text-soft-black hover:bg-gold-dark"
                >
                  Salvar
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGallery;

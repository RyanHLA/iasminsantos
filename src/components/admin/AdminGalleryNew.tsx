import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Trash2, Edit, Upload, Loader2, Star, GripVertical, X, 
  ChevronRight, ArrowLeft, Calendar, Eye, FolderOpen
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

// Masonry Photo Card with hover actions
const MasonryPhotoCard = ({
  image,
  onEdit,
  onDelete,
  onPreview,
  onSetCover,
}: {
  image: GalleryImage;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative mb-4 break-inside-avoid overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute right-2 top-2 z-20 cursor-grab rounded-lg bg-white/90 p-1.5 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-slate-400" />
      </div>

      {/* Image - Natural aspect ratio */}
      <img
        src={image.image_url}
        alt={image.title}
        className="w-full"
        loading="lazy"
      />

      {/* Hover Overlay with Actions */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
        <button
          onClick={onDelete}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md transition-all hover:bg-red-50 hover:text-red-600 hover:scale-110"
          title="Excluir"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          onClick={onPreview}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md transition-all hover:bg-slate-100 hover:scale-110"
          title="Visualizar"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          onClick={onSetCover}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md transition-all hover:bg-amber-50 hover:text-amber-600 hover:scale-110"
          title="Definir como capa"
        >
          <Star className="h-4 w-4" />
        </button>
      </div>

      {/* Title below image */}
      <div className="bg-white p-3">
        <p className="truncate text-sm font-medium text-slate-700">
          {image.title || 'Sem título'}
        </p>
      </div>
    </div>
  );
};

// Category Card - Clean design with title below
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
    className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
  >
    <div className="aspect-[4/3] relative overflow-hidden">
      {coverImage ? (
        <img
          src={coverImage}
          alt={category.label}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-amber-300/60 bg-amber-50/50">
          <FolderOpen className="h-12 w-12 text-amber-400/60" strokeWidth={1.5} />
        </div>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-serif text-lg text-slate-800">{category.label}</h3>
      <p className="mt-1 text-sm text-slate-500">
        {albumCount} {albumCount === 1 ? 'Álbum' : 'Álbuns'}
      </p>
    </div>
  </div>
);

// Album Card - Clean design with title below image
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
  <div className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
    <div onClick={onClick} className="aspect-[4/3] relative overflow-hidden">
      {album.cover_image_url ? (
        <img
          src={album.cover_image_url}
          alt={album.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-amber-300/60 bg-amber-50/50">
          <FolderOpen className="h-12 w-12 text-amber-400/60" strokeWidth={1.5} />
        </div>
      )}
      
      {/* Status Badge */}
      <div className="absolute left-3 top-3">
        <Badge 
          className={album.status === 'published' 
            ? 'bg-emerald-500 text-white border-0' 
            : 'bg-slate-500 text-white border-0'
          }
        >
          {album.status === 'published' ? 'Publicado' : 'Rascunho'}
        </Badge>
      </div>
      
      {/* Action Buttons on Hover */}
      <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-600 shadow-sm transition-all hover:bg-slate-100"
        >
          <Edit className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-red-500 shadow-sm transition-all hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
    
    {/* Info below image */}
    <div onClick={onClick} className="bg-white p-4">
      <h4 className="font-serif text-lg text-slate-800 truncate">{album.title}</h4>
      <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {album.event_date ? new Date(album.event_date).toLocaleDateString('pt-BR') : 'Sem data'}
        </span>
        <span>{photoCount} fotos</span>
      </div>
    </div>
  </div>
);

const AdminGalleryNew = () => {
  // Navigation state
  const [currentLevel, setCurrentLevel] = useState<NavigationLevel>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  
  // Data state
  const [albums, setAlbums] = useState<Album[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({});
  
  // Dialog state
  const [isAlbumDialogOpen, setIsAlbumDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null);
  
  // Upload state
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

  useEffect(() => {
    // Fetch photo counts for all albums
    const fetchAllPhotoCounts = async () => {
      const { data } = await supabase
        .from('site_images')
        .select('album_id');
      
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((img) => {
          if (img.album_id) {
            counts[img.album_id] = (counts[img.album_id] || 0) + 1;
          }
        });
        setPhotoCounts(counts);
      }
    };
    fetchAllPhotoCounts();
  }, [albums, images]);

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

  const getPhotoCount = (albumId: string) => photoCounts[albumId] || 0;

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
      if (selectedAlbum) fetchPhotos(selectedAlbum.id);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
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
              <h2 className="font-serif text-2xl text-slate-800">Portfólio</h2>
              <p className="text-sm text-slate-500">
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
                      className="cursor-pointer text-slate-600 hover:text-amber-600"
                    >
                      Portfólio
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {selectedCategory && (
                    <>
                      <BreadcrumbSeparator className="text-slate-400" />
                      <BreadcrumbItem>
                        {currentLevel === 'albums' ? (
                          <BreadcrumbPage className="text-slate-800">{currentCategoryLabel}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink 
                            onClick={() => { setCurrentLevel('albums'); setSelectedAlbum(null); }}
                            className="cursor-pointer text-slate-600 hover:text-amber-600"
                          >
                            {currentCategoryLabel}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </>
                  )}
                  {selectedAlbum && (
                    <>
                      <BreadcrumbSeparator className="text-slate-400" />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-slate-800">{selectedAlbum.title}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={navigateBack}
                className="mt-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
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
            className="bg-amber-600 text-white hover:bg-amber-700 rounded-xl shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Ensaio
          </Button>
        )}
        {currentLevel === 'photos' && (
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-amber-600 text-white hover:bg-amber-700 rounded-xl shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Fotos
          </Button>
        )}
      </div>

      {/* Level 1: Categories Dashboard */}
      {currentLevel === 'categories' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-300/60 bg-amber-50/30 py-16 text-center">
              <FolderOpen className="mb-4 h-16 w-16 text-amber-400/60" strokeWidth={1.5} />
              <h3 className="font-serif text-xl text-slate-700">Nenhum ensaio ainda</h3>
              <p className="mt-2 text-slate-500">
                Crie seu primeiro ensaio nesta categoria
              </p>
              <Button
                onClick={() => openAlbumDialog()}
                className="mt-6 bg-amber-600 text-white hover:bg-amber-700 rounded-xl"
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

          {/* Upload Area - Gold dotted border on white */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed bg-white p-10 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-amber-500 bg-amber-50/50'
                : 'border-amber-300/60 hover:border-amber-400 hover:bg-amber-50/30'
            }`}
          >
            <Upload className={`mx-auto mb-4 h-12 w-12 ${isDragOver ? 'text-amber-600' : 'text-amber-400/60'}`} strokeWidth={1.5} />
            <p className="font-medium text-slate-700">
              Arraste suas fotos aqui
            </p>
            <p className="mt-1 text-sm text-slate-500">
              ou clique para selecionar
            </p>
          </div>

          {/* Upload Progress */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-700">Enviando fotos...</p>
              {uploadingFiles.map((upload, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img
                    src={upload.preview}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm truncate text-slate-600">{upload.file.name}</p>
                    <Progress value={upload.progress} className="mt-1 h-2" />
                  </div>
                  {upload.status === 'complete' && (
                    <span className="text-xs text-emerald-500">✓</span>
                  )}
                  {upload.status === 'error' && (
                    <span className="text-xs text-red-500">Erro</span>
                  )}
                  {upload.status === 'uploading' && (
                    <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Masonry Photo Grid */}
          {images.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
                <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
                  {images.map((image) => (
                    <MasonryPhotoCard
                      key={image.id}
                      image={image}
                      onEdit={() => handleEditPhoto(image)}
                      onDelete={() => handleDeletePhoto(image.id)}
                      onPreview={() => setPreviewImage(image)}
                      onSetCover={() => handleSetCover(image)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-300/60 bg-amber-50/30 py-16 text-center">
              <Upload className="mb-4 h-12 w-12 text-amber-400/60" strokeWidth={1.5} />
              <p className="text-slate-500">Nenhuma foto neste ensaio ainda</p>
            </div>
          )}
        </>
      )}

      {/* Album Dialog */}
      <Dialog open={isAlbumDialogOpen} onOpenChange={setIsAlbumDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
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
              <Label className="text-slate-700">Título do Ensaio *</Label>
              <Input
                value={albumFormData.title}
                onChange={(e) => setAlbumFormData({ ...albumFormData, title: e.target.value })}
                placeholder="Ex: Mariana & João"
                className="rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Data do Evento</Label>
              <Input
                type="date"
                value={albumFormData.event_date}
                onChange={(e) => setAlbumFormData({ ...albumFormData, event_date: e.target.value })}
                className="rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Status</Label>
              <Select
                value={albumFormData.status}
                onValueChange={(value) => setAlbumFormData({ ...albumFormData, status: value as 'draft' | 'published' })}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Rascunhos não aparecem no site público
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetAlbumForm}
                className="flex-1 rounded-xl border-slate-200"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-xl bg-amber-600 text-white hover:bg-amber-700"
              >
                {editingAlbum ? 'Salvar' : 'Criar Ensaio'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Photo Edit Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Editar Foto</DialogTitle>
          </DialogHeader>
          {editingImage && (
            <form 
              onSubmit={(e) => { e.preventDefault(); handleUpdatePhoto(); }} 
              className="space-y-4"
            >
              <div className="overflow-hidden rounded-xl">
                <img
                  src={editingImage.image_url}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Texto Alternativo (SEO)</Label>
                <Input
                  value={photoFormData.title}
                  onChange={(e) => setPhotoFormData({ ...photoFormData, title: e.target.value })}
                  placeholder="Descreva a imagem"
                  className="rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Descrição</Label>
                <Input
                  value={photoFormData.description}
                  onChange={(e) => setPhotoFormData({ ...photoFormData, description: e.target.value })}
                  placeholder="Descrição adicional"
                  className="rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-400"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPhotoDialogOpen(false)}
                  className="flex-1 rounded-xl border-slate-200"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl bg-amber-600 text-white hover:bg-amber-700"
                >
                  Salvar
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl rounded-2xl bg-slate-900 border-0 p-0">
          {previewImage && (
            <div className="relative">
              <img
                src={previewImage.image_url}
                alt={previewImage.title}
                className="w-full rounded-2xl"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-lg transition-all hover:bg-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGalleryNew;

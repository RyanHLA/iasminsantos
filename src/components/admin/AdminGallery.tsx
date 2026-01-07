import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit, Upload, Loader2, Star, GripVertical, X } from 'lucide-react';
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

interface GalleryImage {
  id: string;
  category: string;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
  is_featured?: boolean;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  preview: string;
}

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
  categoryLabel,
}: {
  image: GalleryImage;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: () => void;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  categoryLabel: string;
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
        <p className="text-xs uppercase tracking-wide text-gold">
          {categoryLabel}
        </p>
        <p className="mt-1 truncate font-medium text-foreground">
          {image.title || 'Sem título'}
        </p>
      </div>
    </div>
  );
};

const AdminGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('casamentos');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Form state for editing
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('site_images')
      .select('*')
      .eq('section', 'gallery')
      .order('display_order');

    if (error) {
      toast({ title: 'Erro ao carregar imagens', variant: 'destructive' });
    } else {
      setImages((data || []) as GalleryImage[]);
    }
    setLoading(false);
  };

  const uploadImage = async (
    file: File,
    onProgress: (progress: number) => void
  ): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    // Simulate progress since Supabase doesn't provide upload progress
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
    const fileArray = Array.from(files);
    
    // Create upload entries with previews
    const newUploads: UploadingFile[] = fileArray.map((file) => ({
      file,
      progress: 0,
      status: 'pending' as const,
      preview: URL.createObjectURL(file),
    }));

    setUploadingFiles((prev) => [...prev, ...newUploads]);

    // Upload files sequentially
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const currentIndex = newUploads.findIndex((u) => u.file === file);
      const uploadIndex = uploadingFiles.length + currentIndex;

      setUploadingFiles((prev) =>
        prev.map((u, idx) =>
          u.file === file ? { ...u, status: 'uploading' as const } : u
        )
      );

      let currentProgress = 0;
      const url = await uploadImage(file, (progress) => {
        currentProgress = progress;
        setUploadingFiles((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, progress: currentProgress } : u
          )
        );
      });

      if (url) {
        // Save to database
        await supabase.from('site_images').insert({
          section: 'gallery',
          category: uploadCategory,
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
          prev.map((u, idx) =>
            idx === uploadIndex ? { ...u, status: 'error' } : u
          )
        );
      }
    }

    // Clean up completed uploads and refresh
    setTimeout(() => {
      setUploadingFiles((prev) => prev.filter((u) => u.status !== 'complete'));
      fetchImages();
    }, 1500);

    toast({ title: `${fileArray.length} foto(s) enviada(s) com sucesso!` });
  }, [images.length, uploadCategory, uploadingFiles.length]);

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

      // Update display_order in database
      const updates = newImages.map((img, idx) => ({
        id: img.id,
        display_order: idx,
      }));

      for (const update of updates) {
        await supabase
          .from('site_images')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingImage) return;

    const { error } = await supabase
      .from('site_images')
      .update({
        category: formData.category,
        title: formData.title,
        description: formData.description,
      })
      .eq('id', editingImage.id);

    if (error) {
      toast({ title: 'Erro ao salvar imagem', variant: 'destructive' });
    } else {
      toast({ title: 'Imagem atualizada com sucesso!' });
      resetForm();
      fetchImages();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

    const { error } = await supabase
      .from('site_images')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro ao excluir imagem', variant: 'destructive' });
    } else {
      toast({ title: 'Imagem excluída com sucesso!' });
      setSelectedImages((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchImages();
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir ${selectedImages.size} imagem(ns)?`)) return;

    for (const id of selectedImages) {
      await supabase.from('site_images').delete().eq('id', id);
    }

    toast({ title: `${selectedImages.size} imagem(ns) excluída(s)!` });
    setSelectedImages(new Set());
    fetchImages();
  };

  const handleToggleFeatured = async (image: GalleryImage) => {
    const { error } = await supabase
      .from('site_images')
      .update({ is_featured: !image.is_featured } as any)
      .eq('id', image.id);

    if (!error) {
      fetchImages();
      toast({ 
        title: image.is_featured ? 'Destaque removido' : 'Marcado como destaque!' 
      });
    }
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setFormData({
      category: image.category,
      title: image.title,
      description: image.description,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ category: '', title: '', description: '' });
    setEditingImage(null);
    setIsDialogOpen(false);
  };

  const toggleImageSelection = (id: string, checked: boolean) => {
    setSelectedImages((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const filteredImages = selectedCategory === 'all'
    ? images
    : images.filter((img) => img.category === selectedCategory);

  if (loading) {
    return <div className="text-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Galeria</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie as fotos da galeria • Arraste para reordenar
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={uploadCategory} onValueChange={setUploadCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gold text-soft-black hover:bg-gold-dark"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Fotos
          </Button>
        </div>
      </div>

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
          Arraste suas fotos para cá ou clique para selecionar
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Categoria selecionada: <span className="text-gold">{CATEGORIES.find(c => c.id === uploadCategory)?.label}</span>
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

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
          className={selectedCategory === 'all' 
            ? 'bg-gold text-soft-black hover:bg-gold-dark' 
            : 'border border-border/50 hover:border-gold/50 hover:text-gold'
          }
        >
          Todas ({images.length})
        </Button>
        {CATEGORIES.map((cat) => {
          const count = images.filter((img) => img.category === cat.id).length;
          return (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id
                ? 'bg-gold text-soft-black hover:bg-gold-dark'
                : 'border border-border/50 hover:border-gold/50 hover:text-gold'
              }
            >
              {cat.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Images Grid with DnD */}
      {filteredImages.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={filteredImages.map((img) => img.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredImages.map((image) => (
                <SortableImageCard
                  key={image.id}
                  image={image}
                  onEdit={() => handleEdit(image)}
                  onDelete={() => handleDelete(image.id)}
                  onToggleFeatured={() => handleToggleFeatured(image)}
                  isSelected={selectedImages.has(image.id)}
                  onSelect={(checked) => toggleImageSelection(image.id, checked)}
                  categoryLabel={CATEGORIES.find((c) => c.id === image.category)?.label || ''}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Bulk Actions Bar */}
      {selectedImages.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fade-in-up">
          <div className="flex items-center gap-4 rounded-full border border-border/50 bg-card px-6 py-3 shadow-xl">
            <span className="text-sm font-medium text-foreground">
              {selectedImages.size} foto(s) selecionada(s)
            </span>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              className="rounded-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Selecionadas
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

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Foto</DialogTitle>
          </DialogHeader>
          {editingImage && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="overflow-hidden rounded-lg">
                <img
                  src={editingImage.image_url}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Texto Alternativo (SEO)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Descreva a imagem para SEO"
                />
                <p className="text-xs text-muted-foreground">
                  Use uma descrição clara da foto para melhorar o SEO
                </p>
              </div>

              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição adicional"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
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

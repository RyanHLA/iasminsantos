import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GalleryImage {
  id: string;
  category: string;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
}

const CATEGORIES = [
  { id: 'casamentos', label: 'Casamentos' },
  { id: 'gestantes', label: 'Gestantes' },
  { id: '15-anos', label: '15 Anos' },
  { id: 'pre-wedding', label: 'Pré-Wedding' },
  { id: 'externo', label: 'Externo' },
  { id: 'eventos', label: 'Eventos' },
];

const AdminGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    file: null as File | null,
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('site_images')
      .select('*')
      .eq('section', 'gallery')
      .order('category')
      .order('display_order');

    if (error) {
      toast({ title: 'Erro ao carregar imagens', variant: 'destructive' });
    } else {
      setImages(data || []);
    }
    setLoading(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `gallery/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('site-images')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data } = supabase.storage
      .from('site-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = editingImage?.image_url || '';

      if (formData.file) {
        const url = await uploadImage(formData.file);
        if (!url) {
          toast({ title: 'Erro ao fazer upload da imagem', variant: 'destructive' });
          setUploading(false);
          return;
        }
        imageUrl = url;
      }

      if (editingImage) {
        const { error } = await supabase
          .from('site_images')
          .update({
            category: formData.category,
            title: formData.title,
            description: formData.description,
            image_url: imageUrl,
          })
          .eq('id', editingImage.id);

        if (error) throw error;
        toast({ title: 'Imagem atualizada com sucesso!' });
      } else {
        const { error } = await supabase
          .from('site_images')
          .insert({
            section: 'gallery',
            category: formData.category,
            title: formData.title,
            description: formData.description,
            image_url: imageUrl,
            display_order: images.length,
          });

        if (error) throw error;
        toast({ title: 'Imagem adicionada com sucesso!' });
      }

      resetForm();
      fetchImages();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Erro ao salvar imagem', variant: 'destructive' });
    } finally {
      setUploading(false);
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
      fetchImages();
    }
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setFormData({
      category: image.category,
      title: image.title,
      description: image.description,
      file: null,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ category: '', title: '', description: '', file: null });
    setEditingImage(null);
    setIsDialogOpen(false);
  };

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  if (loading) {
    return <div className="text-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Galeria</h2>
          <p className="text-sm text-muted-foreground">Gerencie as fotos da galeria</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-gold text-soft-black hover:bg-gold-dark">
              <Plus className="mr-2 h-4 w-4" />
              Nova Foto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? 'Editar Foto' : 'Adicionar Foto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label>Título</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Casamento Maria e João"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Uma breve descrição da foto"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Imagem</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                    className="flex-1"
                  />
                </div>
                {editingImage && !formData.file && (
                  <p className="text-xs text-muted-foreground">
                    Deixe vazio para manter a imagem atual
                  </p>
                )}
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
                  disabled={uploading || (!editingImage && !formData.file) || !formData.category}
                  className="flex-1 bg-gold text-soft-black hover:bg-gold-dark"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
          className={selectedCategory === 'all' ? 'bg-gold text-soft-black' : ''}
        >
          Todas
        </Button>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className={selectedCategory === cat.id ? 'bg-gold text-soft-black' : ''}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Images Grid */}
      {filteredImages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/50 p-12 text-center">
          <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            Nenhuma foto encontrada. Adicione sua primeira foto!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-lg border border-border/50 bg-card"
            >
              <div className="aspect-[3/4]">
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="text-xs uppercase tracking-wide text-gold">
                  {CATEGORIES.find(c => c.id === image.category)?.label}
                </p>
                <p className="mt-1 truncate font-medium text-foreground">
                  {image.title || 'Sem título'}
                </p>
              </div>
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => handleEdit(image)}
                  className="h-8 w-8"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDelete(image.id)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;

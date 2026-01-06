import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AboutImage {
  id: string;
  image_url: string;
}

const AdminAbout = () => {
  const [aboutImage, setAboutImage] = useState<AboutImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAboutImage();
  }, []);

  const fetchAboutImage = async () => {
    const { data, error } = await supabase
      .from('site_images')
      .select('*')
      .eq('section', 'about')
      .maybeSingle();

    if (error) {
      console.error('Error fetching about:', error);
    } else {
      setAboutImage(data);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `about/${Date.now()}.${fileExt}`;

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

  const handleSave = async () => {
    if (!selectedFile) return;

    setUploading(true);

    try {
      const imageUrl = await uploadImage(selectedFile);
      if (!imageUrl) {
        toast({ title: 'Erro ao fazer upload da imagem', variant: 'destructive' });
        return;
      }

      if (aboutImage) {
        const { error } = await supabase
          .from('site_images')
          .update({ image_url: imageUrl })
          .eq('id', aboutImage.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_images')
          .insert({
            section: 'about',
            image_url: imageUrl,
            title: 'About Image',
          });

        if (error) throw error;
      }

      toast({ title: 'Foto de perfil atualizada com sucesso!' });
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchAboutImage();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Erro ao salvar imagem', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Carregando...</div>;
  }

  const displayUrl = previewUrl || aboutImage?.image_url;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-foreground">Foto "Sobre Mim"</h2>
        <p className="text-sm text-muted-foreground">
          A foto que aparece na seção "Sobre Mim"
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Preview */}
        <div className="space-y-4">
          <Label>Prévia</Label>
          <div className="relative aspect-[3/4] max-w-sm overflow-hidden rounded-lg border border-border/50 bg-muted">
            {displayUrl ? (
              <img
                src={displayUrl}
                alt="About preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Upload className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
          </div>
        </div>

        {/* Upload */}
        <div className="space-y-4">
          <Label>Nova Imagem</Label>
          <div className="space-y-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: foto em formato retrato (3:4) para melhor enquadramento.
            </p>

            {selectedFile && (
              <Button
                onClick={handleSave}
                disabled={uploading}
                className="w-full bg-gold text-soft-black hover:bg-gold-dark"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAbout;

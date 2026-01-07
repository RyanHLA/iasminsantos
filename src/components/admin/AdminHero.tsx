import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Upload, Save, Monitor, Smartphone, Replace, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import heroImageFallback from '@/assets/hero-wedding.jpg';

interface HeroContent {
  id: string;
  image_url: string;
  title?: string;
  description?: string;
}

const AdminHero = () => {
  const [heroData, setHeroData] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  
  // Content fields
  const [mainTitle, setMainTitle] = useState('Iasmin Santos');
  const [subtitle, setSubtitle] = useState('Fotografia com Emoção');
  const [buttonText, setButtonText] = useState('Solicite um Orçamento');
  
  // Focal point
  const [focalPoint, setFocalPoint] = useState({ x: 50, y: 50 });
  const previewImageRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    const { data, error } = await supabase
      .from('site_images')
      .select('*')
      .eq('section', 'hero')
      .maybeSingle();

    if (error) {
      console.error('Error fetching hero:', error);
    } else if (data) {
      setHeroData(data);
      // Parse title for content fields if stored
      if (data.title) {
        try {
          const parsed = JSON.parse(data.title);
          if (parsed.mainTitle) setMainTitle(parsed.mainTitle);
          if (parsed.subtitle) setSubtitle(parsed.subtitle);
          if (parsed.buttonText) setButtonText(parsed.buttonText);
          if (parsed.focalPoint) setFocalPoint(parsed.focalPoint);
        } catch {
          // Title is not JSON, use as-is
        }
      }
    }
    setLoading(false);
  };

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
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFocalPointClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewImageRef.current) return;
    const rect = previewImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setFocalPoint({ x: Math.round(x), y: Math.round(y) });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `hero/${Date.now()}.${fileExt}`;

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
    setUploading(true);

    try {
      let imageUrl = heroData?.image_url;

      // Upload new image if selected
      if (selectedFile) {
        const newUrl = await uploadImage(selectedFile);
        if (!newUrl) {
          toast({ title: 'Erro ao fazer upload da imagem', variant: 'destructive' });
          setUploading(false);
          return;
        }
        imageUrl = newUrl;
      }

      // Store content data in title field as JSON
      const contentData = JSON.stringify({
        mainTitle,
        subtitle,
        buttonText,
        focalPoint,
      });

      if (heroData) {
        const { error } = await supabase
          .from('site_images')
          .update({ 
            image_url: imageUrl,
            title: contentData,
          })
          .eq('id', heroData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_images')
          .insert({
            section: 'hero',
            image_url: imageUrl || '',
            title: contentData,
          });

        if (error) throw error;
      }

      toast({ title: 'Hero atualizado com sucesso!' });
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchHeroData();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const displayUrl = previewUrl || heroData?.image_url || heroImageFallback;
  const hasImage = previewUrl || heroData?.image_url;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl text-foreground">Editor do Hero</h2>
        <p className="text-sm text-muted-foreground">
          Personalize a imagem e o conteúdo do banner principal do site
        </p>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Left Column - Live Preview (3/5 width) */}
        <div className="space-y-4 lg:col-span-3">
          {/* Preview Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Prévia ao Vivo</Label>
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-1">
              <button
                onClick={() => setIsMobilePreview(false)}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  !isMobilePreview
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                Desktop
              </button>
              <button
                onClick={() => setIsMobilePreview(true)}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  isMobilePreview
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                Mobile
              </button>
            </div>
          </div>

          {/* Live Preview Container */}
          <div className="overflow-hidden rounded-xl border border-border/50 bg-muted/20 p-4">
            <div
              className={`relative mx-auto overflow-hidden rounded-lg shadow-2xl transition-all duration-500 ${
                isMobilePreview ? 'max-w-[280px]' : 'w-full'
              }`}
              style={{ aspectRatio: isMobilePreview ? '9/16' : '16/9' }}
            >
              {/* Simulated Hero Section */}
              <div
                ref={previewImageRef}
                className="group relative h-full w-full cursor-crosshair"
                onClick={handleFocalPointClick}
              >
                {/* Background Image */}
                <img
                  src={displayUrl}
                  alt="Hero preview"
                  className="h-full w-full object-cover transition-all"
                  style={{ objectPosition: `${focalPoint.x}% ${focalPoint.y}%` }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />

                {/* Focal Point Indicator */}
                <div
                  className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white/30 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ left: `${focalPoint.x}%`, top: `${focalPoint.y}%` }}
                >
                  <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <p className={`mb-2 font-sans uppercase tracking-[0.2em] text-white/90 ${
                    isMobilePreview ? 'text-[8px]' : 'text-xs'
                  }`}>
                    {subtitle || 'Subtítulo'}
                  </p>
                  
                  <h1 className={`font-serif font-light leading-tight text-white ${
                    isMobilePreview ? 'text-xl' : 'text-3xl lg:text-4xl'
                  }`}>
                    {mainTitle || 'Título Principal'}
                  </h1>
                  
                  <div className={`mt-4 rounded-sm border border-white/40 bg-white/10 px-4 py-2 font-sans text-white backdrop-blur-sm ${
                    isMobilePreview ? 'text-[10px]' : 'text-xs'
                  }`}>
                    {buttonText || 'Texto do Botão'}
                  </div>
                </div>

                {/* Focal Point Hint */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Clique para definir o ponto focal
                </div>
              </div>
            </div>
          </div>

          {/* Focal Point Info */}
          <p className="text-center text-xs text-muted-foreground">
            Ponto focal: {focalPoint.x}% horizontal, {focalPoint.y}% vertical
          </p>
        </div>

        {/* Right Column - Settings (2/5 width) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Upload Area */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Imagem do Banner</Label>
            
            {hasImage ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {selectedFile?.name || 'hero-image.jpg'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedFile 
                        ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` 
                        : 'Imagem atual'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0"
                  >
                    <Replace className="mr-2 h-4 w-4" />
                    Substituir
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                  isDragOver
                    ? 'border-gold bg-gold/5'
                    : 'border-border/50 hover:border-gold/50 hover:bg-muted/30'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Arraste sua foto para cá
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ou clique para selecionar
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <p className="text-xs text-muted-foreground">
              Recomendado: 1920×1080px ou maior para melhor qualidade
            </p>
          </div>

          {/* Content Fields */}
          <div className="space-y-4 rounded-xl border border-border/50 bg-muted/20 p-4">
            <div>
              <h3 className="text-sm font-medium text-foreground">Conteúdo do Banner</h3>
              <p className="text-xs text-muted-foreground">
                O texto aparece em tempo real na prévia
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subtitle" className="text-xs">
                  Subtítulo
                </Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: Fotografia com Emoção"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainTitle" className="text-xs">
                  Título Principal
                </Label>
                <Input
                  id="mainTitle"
                  value={mainTitle}
                  onChange={(e) => setMainTitle(e.target.value)}
                  placeholder="Ex: Iasmin Santos"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonText" className="text-xs">
                  Texto do Botão
                </Label>
                <Input
                  id="buttonText"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Ex: Solicite um Orçamento"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
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
        </div>
      </div>
    </div>
  );
};

export default AdminHero;

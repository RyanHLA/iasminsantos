import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Images } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Album {
  id: string;
  title: string;
  category: string;
  event_date: string | null;
  cover_image_url: string | null;
}

interface Photo {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
}

const categoryTitles: Record<string, string> = {
  casamentos: "Casamentos",
  gestantes: "Gestantes",
  "15-anos": "15 Anos",
  "pre-wedding": "Pré-Wedding",
  externo: "Externo",
  eventos: "Eventos",
};

const AlbumPhotos = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!albumId) return;

    const fetchData = async () => {
      setLoading(true);

      // Fetch album details
      const { data: albumData } = await supabase
        .from("albums")
        .select("*")
        .eq("id", albumId)
        .single();

      if (albumData) {
        setAlbum(albumData);

        // Fetch photos
        const { data: photosData } = await supabase
          .from("site_images")
          .select("*")
          .eq("album_id", albumId)
          .order("display_order");

        setPhotos(photosData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [albumId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Álbum não encontrado.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryTitle = categoryTitles[album.category] || album.category;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Banner */}
        <div className="relative h-64 overflow-hidden bg-muted md:h-80">
          {album.cover_image_url ? (
            <img
              src={album.cover_image_url}
              alt={album.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <Images className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-soft-black/60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="mb-2 font-sans text-sm uppercase tracking-[0.25em] text-gold">
              {categoryTitle}
            </p>
            <h1 className="font-serif text-3xl font-normal text-primary-foreground md:text-4xl lg:text-5xl">
              {album.title}
            </h1>
            {album.event_date && (
              <p className="mt-4 font-sans text-sm text-primary-foreground/80">
                {formatDate(album.event_date)}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <section className="section-padding bg-background">
          <div className="mx-auto max-w-7xl px-6">
            {/* Breadcrumbs */}
            <div className="mb-8 flex items-center gap-2 text-sm">
              <Link
                to="/#albuns"
                className="text-muted-foreground transition-colors hover:text-gold"
              >
                Álbuns
              </Link>
              <span className="text-muted-foreground">/</span>
              <Link
                to={`/categoria/${album.category}`}
                className="text-muted-foreground transition-colors hover:text-gold"
              >
                {categoryTitle}
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground">{album.title}</span>
            </div>

            {/* Back button */}
            <Link
              to={`/categoria/${album.category}`}
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar para {categoryTitle}
            </Link>

            {photos.length === 0 ? (
              <div className="py-16 text-center">
                <Images className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Nenhuma foto neste álbum ainda.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group aspect-square overflow-hidden rounded-lg"
                  >
                    <img
                      src={photo.image_url}
                      alt={photo.title || "Foto do álbum"}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AlbumPhotos;

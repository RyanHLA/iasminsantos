import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ArrowRight, Images, Heart, Share2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Fallback images
import casamentoImg from "@/assets/gallery-casamento.jpg";
import gestanteImg from "@/assets/gallery-gestante.jpg";
import quinzeImg from "@/assets/gallery-15anos.jpg";
import preweddingImg from "@/assets/gallery-prewedding.jpg";
import externoImg from "@/assets/gallery-externo.jpg";
import eventosImg from "@/assets/gallery-eventos.jpg";

interface Album {
  id: string;
  title: string;
  category: string;
  event_date: string | null;
  cover_image_url: string | null;
  status: string;
}

interface Photo {
  id: string;
  image_url: string;
  title: string | null;
}

const categoryData: Record<
  string,
  { title: string; image: string; description: string }
> = {
  casamentos: {
    title: "Casamentos",
    image: casamentoImg,
    description: "O grande dia eternizado com emoção e delicadeza",
  },
  gestantes: {
    title: "Gestantes",
    image: gestanteImg,
    description: "A espera mais doce registrada em cada detalhe",
  },
  "15-anos": {
    title: "15 Anos",
    image: quinzeImg,
    description: "Celebrando a transição para uma nova fase",
  },
  "pre-wedding": {
    title: "Pré-Wedding",
    image: preweddingImg,
    description: "O amor do casal antes do grande dia",
  },
  externo: {
    title: "Externo",
    image: externoImg,
    description: "Retratos ao ar livre com luz natural",
  },
  eventos: {
    title: "Eventos",
    image: eventosImg,
    description: "Momentos especiais em celebrações únicas",
  },
};

// Album Card Component
const AlbumCard = ({
  album,
  year,
  onClick,
}: {
  album: Album;
  year: string;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="group relative h-[400px] w-full cursor-pointer overflow-hidden rounded-sm transition-transform duration-500 hover:z-10 hover:scale-[1.03]"
  >
    {/* Background Image */}
    {album.cover_image_url ? (
      <img
        src={album.cover_image_url}
        alt={album.title}
        className="absolute inset-0 h-full w-full object-cover"
      />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
        <Images className="h-16 w-16 text-white/20" />
      </div>
    )}

    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 transition-all duration-500 group-hover:from-black/90 group-hover:via-black/50" />

    {/* Content */}
    <div className="absolute inset-0 flex flex-col justify-end p-6">
      {/* Tags */}
      <div className="mb-3 flex items-center gap-3">
        <span className="rounded-full bg-white/20 px-3 py-1 font-sans text-xs uppercase tracking-wider text-white/90 backdrop-blur-sm">
          {categoryData[album.category]?.title || album.category}
        </span>
        <span className="font-sans text-sm text-white/70">{year}</span>
      </div>

      {/* Title */}
      <h3 className="font-serif text-2xl font-normal leading-tight text-white transition-all duration-300 group-hover:text-white md:text-3xl">
        {album.title}
      </h3>

      {/* View Button */}
      <div className="mt-4 flex items-center gap-2 text-sm text-white/70 transition-all duration-300 group-hover:text-white">
        Ver Álbum{" "}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </div>
  </div>
);

// Detail View Component (Masonry Grid)
const DetailView = ({
  album,
  photos,
  onClose,
}: {
  album: Album;
  photos: Photo[];
  onClose: () => void;
}) => {
  const year = album.event_date
    ? new Date(album.event_date).getFullYear().toString()
    : "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Fixed Navigation Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-black/50 px-6 py-4 backdrop-blur-md">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar
        </button>
        <span className="font-sans text-sm uppercase tracking-[0.2em] text-white/50">
          {categoryData[album.category]?.title || album.category}
        </span>
        <div className="flex items-center gap-4">
          <button className="text-white/50 transition-colors hover:text-white">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Album Hero Title */}
      <div className="px-6 pb-12 pt-28 text-center">
        <p className="mb-2 font-sans text-sm uppercase tracking-[0.25em] text-white/50">
          {categoryData[album.category]?.title || album.category} — {year}
        </p>
        <h1 className="font-serif text-4xl font-normal text-white md:text-5xl lg:text-6xl">
          {album.title}
        </h1>
        <p className="mx-auto mt-6 max-w-xl font-sans text-base font-light leading-relaxed text-white/60">
          Uma curadoria de momentos capturados com sensibilidade e precisão
          técnica. Cada imagem conta um fragmento desta história visual.
        </p>
      </div>

      {/* Masonry Grid */}
      <div className="mx-auto max-w-6xl px-4 pb-20">
        {photos.length === 0 ? (
          <div className="py-16 text-center">
            <Images className="mx-auto mb-4 h-12 w-12 text-white/20" />
            <p className="text-white/50">Nenhuma foto neste álbum ainda.</p>
          </div>
        ) : (
          <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className="group relative mb-4 break-inside-avoid overflow-hidden rounded-sm"
                style={{
                  animationDelay: `${idx * 0.05}s`,
                }}
              >
                <img
                  src={photo.image_url}
                  alt={photo.title || "Foto do álbum"}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/30 group-hover:opacity-100">
                  <button className="rounded-full bg-white/20 p-3 backdrop-blur-sm transition-transform hover:scale-110">
                    <Heart className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Album Footer */}
      <div className="border-t border-white/10 px-6 py-16 text-center">
        <p className="mb-6 font-serif text-xl text-white">
          Gostou deste projeto?
        </p>
        <Link
          to="/#contato"
          className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-sans text-sm font-medium text-black transition-all hover:bg-white/90"
        >
          Solicitar Orçamento
        </Link>
      </div>
    </div>
  );
};

const CategoryAlbums = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<Photo[]>([]);

  const category = categoryId ? categoryData[categoryId] : null;

  useEffect(() => {
    if (!categoryId) return;

    const fetchAlbums = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("albums")
        .select("*")
        .eq("category", categoryId)
        .eq("status", "published")
        .order("event_date", { ascending: false });

      setAlbums(data || []);
      setLoading(false);
    };

    fetchAlbums();
  }, [categoryId]);

  // Fetch photos when an album is selected
  useEffect(() => {
    if (!selectedAlbum) {
      setAlbumPhotos([]);
      return;
    }

    const fetchPhotos = async () => {
      const { data } = await supabase
        .from("site_images")
        .select("id, image_url, title")
        .eq("album_id", selectedAlbum.id)
        .order("display_order");

      setAlbumPhotos(data || []);
    };

    fetchPhotos();
  }, [selectedAlbum]);

  const getYear = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).getFullYear().toString();
  };

  // Show Detail View if album is selected
  if (selectedAlbum) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <DetailView
            album={selectedAlbum}
            photos={albumPhotos}
            onClose={() => setSelectedAlbum(null)}
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-[#0a0a0a]">
          <p className="text-white/50">Categoria não encontrada.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-[#0a0a0a]">
        {/* Fixed Navigation Header */}
        <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-black/50 px-6 py-4 backdrop-blur-md">
          <button
            onClick={() => navigate("/#albuns")}
            className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar
          </button>
          <span className="font-sans text-sm uppercase tracking-[0.2em] text-white/50">
            {category.title}
          </span>
          <div className="w-20" />
        </div>

        {/* Section Header */}
        <div className="px-6 pb-12 pt-28">
          <p className="mb-4 font-sans text-sm uppercase tracking-[0.3em] text-white/50">
            {category.title}
          </p>
          <p className="max-w-xl font-sans text-base font-light leading-relaxed text-white/60">
            {category.description}
          </p>
        </div>

        {/* Albums Grid */}
        <div className="mx-auto max-w-7xl px-6 pb-20">
          {loading ? (
            <div className="py-16 text-center">
              <p className="text-white/50">Carregando álbuns...</p>
            </div>
          ) : albums.length === 0 ? (
            <div className="py-16 text-center">
              <Images className="mx-auto mb-4 h-12 w-12 text-white/20" />
              <p className="text-white/50">
                Nenhum álbum publicado nesta categoria ainda.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  year={getYear(album.event_date)}
                  onClick={() => setSelectedAlbum(album)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryAlbums;

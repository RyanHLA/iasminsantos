import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Calendar, Images } from "lucide-react";

// Fallback images
import casamentoImg from "@/assets/gallery-casamento.jpg";
import gestanteImg from "@/assets/gallery-gestante.jpg";
import quinzeImg from "@/assets/gallery-15anos.jpg";
import preweddingImg from "@/assets/gallery-prewedding.jpg";
import externoImg from "@/assets/gallery-externo.jpg";
import eventosImg from "@/assets/gallery-eventos.jpg";

interface Category {
  id: string;
  title: string;
  image: string;
  description: string;
}

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
  description: string | null;
}

const defaultCategories: Category[] = [
  {
    id: "casamentos",
    title: "Casamentos",
    image: casamentoImg,
    description: "O grande dia eternizado com emoção e delicadeza",
  },
  {
    id: "gestantes",
    title: "Gestantes",
    image: gestanteImg,
    description: "A espera mais doce registrada em cada detalhe",
  },
  {
    id: "15-anos",
    title: "15 Anos",
    image: quinzeImg,
    description: "Celebrando a transição para uma nova fase",
  },
  {
    id: "pre-wedding",
    title: "Pré-Wedding",
    image: preweddingImg,
    description: "O amor do casal antes do grande dia",
  },
  {
    id: "externo",
    title: "Externo",
    image: externoImg,
    description: "Retratos ao ar livre com luz natural",
  },
  {
    id: "eventos",
    title: "Eventos",
    image: eventosImg,
    description: "Momentos especiais em celebrações únicas",
  },
];

type ViewLevel = "categories" | "albums" | "photos";

const Gallery = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [currentLevel, setCurrentLevel] = useState<ViewLevel>("categories");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albumCounts, setAlbumCounts] = useState<Record<string, number>>({});

  // Fetch album counts for each category
  useEffect(() => {
    const fetchAlbumCounts = async () => {
      const { data } = await supabase
        .from("albums")
        .select("category")
        .eq("status", "published");

      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((album) => {
          counts[album.category] = (counts[album.category] || 0) + 1;
        });
        setAlbumCounts(counts);
      }
    };

    fetchAlbumCounts();
  }, []);

  // Fetch gallery cover images from database
  useEffect(() => {
    const fetchGalleryImages = async () => {
      const { data } = await supabase
        .from("site_images")
        .select("*")
        .eq("section", "gallery")
        .order("display_order");

      if (data && data.length > 0) {
        const categoryMap = new Map<string, { image: string }>();

        data.forEach((img) => {
          if (img.category && !categoryMap.has(img.category)) {
            categoryMap.set(img.category, { image: img.image_url });
          }
        });

        const updatedCategories = defaultCategories.map((cat) => {
          const dbImage = categoryMap.get(cat.id);
          if (dbImage) {
            return { ...cat, image: dbImage.image };
          }
          return cat;
        });

        setCategories(updatedCategories);
      }
    };

    fetchGalleryImages();
  }, []);

  // Fetch albums when a category is selected
  useEffect(() => {
    if (selectedCategory) {
      const fetchAlbums = async () => {
        const { data } = await supabase
          .from("albums")
          .select("*")
          .eq("category", selectedCategory.id)
          .eq("status", "published")
          .order("event_date", { ascending: false });

        setAlbums(data || []);
      };
      fetchAlbums();
    }
  }, [selectedCategory]);

  // Fetch photos when an album is selected
  useEffect(() => {
    if (selectedAlbum) {
      const fetchPhotos = async () => {
        const { data } = await supabase
          .from("site_images")
          .select("*")
          .eq("album_id", selectedAlbum.id)
          .order("display_order");

        setPhotos(data || []);
      };
      fetchPhotos();
    }
  }, [selectedAlbum]);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setCurrentLevel("albums");
  };

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
    setCurrentLevel("photos");
  };

  const handleBack = () => {
    if (currentLevel === "photos") {
      setSelectedAlbum(null);
      setPhotos([]);
      setCurrentLevel("albums");
    } else if (currentLevel === "albums") {
      setSelectedCategory(null);
      setAlbums([]);
      setCurrentLevel("categories");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Breadcrumb navigation
  const renderBreadcrumbs = () => {
    if (currentLevel === "categories") return null;

    return (
      <div className="mb-8 flex items-center gap-2 text-sm">
        <button
          onClick={() => {
            setSelectedCategory(null);
            setSelectedAlbum(null);
            setAlbums([]);
            setPhotos([]);
            setCurrentLevel("categories");
          }}
          className="text-muted-foreground transition-colors hover:text-gold"
        >
          Álbuns
        </button>
        {selectedCategory && (
          <>
            <span className="text-muted-foreground">/</span>
            <button
              onClick={() => {
                if (currentLevel === "photos") {
                  setSelectedAlbum(null);
                  setPhotos([]);
                  setCurrentLevel("albums");
                }
              }}
              className={`transition-colors ${
                currentLevel === "albums"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-gold"
              }`}
            >
              {selectedCategory.title}
            </button>
          </>
        )}
        {selectedAlbum && (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">{selectedAlbum.title}</span>
          </>
        )}
      </div>
    );
  };

  // Level 1: Categories
  const renderCategories = () => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <div
          key={category.id}
          className="group relative aspect-[3/4] cursor-pointer overflow-hidden"
          onMouseEnter={() => setHoveredId(category.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => handleCategoryClick(category)}
        >
          <img
            src={category.image}
            alt={`Fotografia de ${category.title}`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              hoveredId === category.id
                ? "bg-soft-black/60"
                : "bg-gradient-to-t from-soft-black/70 via-soft-black/20 to-transparent"
            }`}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-center">
            <h3 className="font-serif text-2xl font-normal text-primary-foreground transition-all duration-300 group-hover:mb-2">
              {category.title}
            </h3>
            <p className="mb-2 text-xs uppercase tracking-wider text-gold">
              {albumCounts[category.id] || 0} Álbuns
            </p>
            <p
              className={`max-w-xs font-sans text-sm font-light text-primary-foreground/80 transition-all duration-300 ${
                hoveredId === category.id
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
            >
              {category.description}
            </p>
            <div
              className={`mt-4 h-[1px] w-12 bg-gold transition-all duration-500 ${
                hoveredId === category.id ? "w-24 opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );

  // Level 2: Albums in a category
  const renderAlbums = () => (
    <div>
      <button
        onClick={handleBack}
        className="mb-8 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar
      </button>

      {albums.length === 0 ? (
        <div className="py-16 text-center">
          <Images className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            Nenhum álbum publicado nesta categoria ainda.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <div
              key={album.id}
              className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-gold/30 hover:shadow-lg"
              onClick={() => handleAlbumClick(album)}
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                {album.cover_image_url ? (
                  <img
                    src={album.cover_image_url}
                    alt={album.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Images className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-serif text-lg text-foreground">
                  {album.title}
                </h3>
                {album.event_date && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(album.event_date)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Level 3: Photos in an album
  const renderPhotos = () => (
    <div>
      <button
        onClick={handleBack}
        className="mb-8 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar para {selectedCategory?.title}
      </button>

      {/* Album header */}
      <div className="mb-8 text-center">
        <h3 className="font-serif text-2xl text-foreground">
          {selectedAlbum?.title}
        </h3>
        {selectedAlbum?.event_date && (
          <p className="mt-2 text-sm text-muted-foreground">
            {formatDate(selectedAlbum.event_date)}
          </p>
        )}
      </div>

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
  );

  return (
    <section id="galeria" className="section-padding bg-background">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 font-sans text-sm uppercase tracking-[0.25em] text-gold">
            Portfólio
          </p>
          <h2 className="font-serif text-3xl font-normal text-foreground md:text-4xl lg:text-5xl">
            Álbuns
          </h2>
          <div className="mx-auto mt-6 h-[1px] w-16 bg-gold/50" />
          <p className="mx-auto mt-6 max-w-lg font-sans text-base font-light leading-relaxed text-muted-foreground">
            Explore as diferentes categorias e descubra como cada momento
            especial pode ser transformado em memória eterna
          </p>
        </div>

        {/* Breadcrumbs */}
        {renderBreadcrumbs()}

        {/* Content based on current level */}
        {currentLevel === "categories" && renderCategories()}
        {currentLevel === "albums" && renderAlbums()}
        {currentLevel === "photos" && renderPhotos()}
      </div>
    </section>
  );
};

export default Gallery;

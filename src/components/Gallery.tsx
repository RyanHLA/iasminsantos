import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

const AlbumCard = ({
  category,
  albumCount,
}: {
  category: Category;
  albumCount: number;
}) => (
  <Link
    to={`/categoria/${category.id}`}
    className="group relative h-[400px] w-full cursor-pointer overflow-hidden rounded-sm transition-transform duration-500 hover:z-10 hover:scale-[1.03]"
  >
    {/* Background Image */}
    <img
      src={category.image}
      alt={`Fotografia de ${category.title}`}
      className="absolute inset-0 h-full w-full object-cover"
    />

    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 transition-all duration-500 group-hover:from-black/90 group-hover:via-black/50" />

    {/* Content */}
    <div className="absolute inset-0 flex flex-col justify-end p-6">
      {/* Tags */}
      <div className="mb-3 flex items-center gap-3">
        <span className="rounded-full bg-white/20 px-3 py-1 font-sans text-xs uppercase tracking-wider text-white/90 backdrop-blur-sm">
          {category.title}
        </span>
        <span className="font-sans text-sm text-white/70">
          {albumCount} {albumCount === 1 ? "Álbum" : "Álbuns"}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-serif text-2xl font-normal leading-tight text-white transition-all duration-300 group-hover:text-white md:text-3xl">
        {category.description}
      </h3>

      {/* View Button */}
      <div className="mt-4 flex items-center gap-2 text-sm text-white/70 transition-all duration-300 group-hover:text-white">
        Ver Álbuns{" "}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </div>
  </Link>
);

const Gallery = () => {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-16">
          <p className="mb-4 font-sans text-sm uppercase tracking-[0.3em] text-white/50">
            Portfólio Selecionado
          </p>
          <p className="max-w-xl font-sans text-base font-light leading-relaxed text-white/60">
            Explorações visuais através de luz, sombra e composição. Selecione
            uma categoria para ver os álbuns completos.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <AlbumCard
              key={category.id}
              category={category}
              albumCount={albumCounts[category.id] || 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;

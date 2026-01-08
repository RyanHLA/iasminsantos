import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
    <div className="section-padding bg-background">
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

        {/* Categories Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categoria/${category.id}`}
              className="group relative h-[400px] w-full cursor-pointer overflow-hidden rounded-sm transition-transform duration-500 hover:scale-[1.03] hover:z-10"
            >
              {/* Imagem de Fundo (Sem Zoom) */}
              <img
                src={category.image}
                alt={`Fotografia de ${category.title}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              
              {/* Overlay Gradiente (Sempre visível para legibilidade, mas escurece no hover) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/80 group-hover:via-black/40" />

              {/* Conteúdo */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <div className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-white/70">
                  <span className="border border-white/30 px-2 py-1">
                    {category.title}
                  </span>
                  <span>
                    {albumCounts[category.id] || 0} Álbuns
                  </span>
                </div>
                
                <h3 className="font-serif text-2xl font-normal text-white md:text-3xl">
                  {category.description}
                </h3>
                
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white/80 transition-all duration-300 group-hover:text-white group-hover:gap-3">
                  Ver Álbum <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
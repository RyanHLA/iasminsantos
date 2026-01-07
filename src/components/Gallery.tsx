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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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
    <section id="albuns" className="section-padding bg-background">
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
              className="group relative aspect-[3/4] cursor-pointer overflow-hidden"
              onMouseEnter={() => setHoveredId(category.id)}
              onMouseLeave={() => setHoveredId(null)}
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, Camera } from "lucide-react";
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

interface CategoryCardProps {
  category: Category;
  index: number;
  total: number;
  albumCount: number;
  setRef: (el: HTMLDivElement | null, index: number) => void;
}

const CategoryCard = ({ category, index, total, albumCount, setRef }: CategoryCardProps) => {
  return (
    <div
      ref={(el) => setRef(el, index)}
      className="category-card sticky top-0 h-[100dvh] w-full flex flex-col justify-center items-center overflow-hidden border-t border-white/10 shadow-2xl transition-transform will-change-transform"
      style={{ zIndex: index + 1 }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={category.image}
          alt={`Fotografia de ${category.title}`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
      </div>

      {/* Overlay de Dimming */}
      <div className="card-overlay absolute inset-0 bg-black pointer-events-none opacity-0 z-20 will-change-opacity" />

      {/* Conteúdo */}
      <div className="card-content container mx-auto px-6 relative z-10 flex flex-col items-center justify-center text-center h-full will-change-transform">
        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center justify-center gap-3 text-sm uppercase tracking-widest text-gold">
            <Camera size={16} />
            <span>0{index + 1} / 0{total} — {albumCount} Álbuns</span>
          </div>
          
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-normal text-primary-foreground leading-tight">
            {category.title}
          </h2>
          
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-lg mx-auto leading-relaxed font-light">
            {category.description}
          </p>

          <div className="pt-8">
            <Link
              to={`/categoria/${category.id}`}
              className="inline-flex items-center gap-2 px-8 py-3 border border-gold text-gold hover:bg-gold hover:text-soft-black transition-all duration-300 font-sans text-sm uppercase tracking-widest"
            >
              Ver Álbuns <ArrowDown size={16} className="-rotate-90" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator apenas no primeiro card */}
      {index === 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gold/50 z-30 pointer-events-none">
          <ArrowDown size={24} />
        </div>
      )}
    </div>
  );
};

const Gallery = () => {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [albumCounts, setAlbumCounts] = useState<Record<string, number>>({});
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const setRef = (el: HTMLDivElement | null, index: number) => {
    cardsRef.current[index] = el;
  };

  // Sticky stack scroll effect
  useEffect(() => {
    let requestAnimationFrameId: number;

    const handleScroll = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      const viewportHeight = window.innerHeight;

      cardsRef.current.forEach((card, index) => {
        if (index === cardsRef.current.length - 1 || !card) return;

        const nextCard = cardsRef.current[index + 1];
        if (!nextCard) return;

        const nextCardRect = nextCard.getBoundingClientRect();
        
        if (nextCardRect.top > viewportHeight * 1.5) {
          card.style.transform = 'scale(1)';
          const overlay = card.querySelector('.card-overlay') as HTMLElement;
          if (overlay) overlay.style.opacity = '0';
          return; 
        }

        const distanceToTop = nextCardRect.top;
        let progress = 0;

        if (distanceToTop <= viewportHeight) {
          progress = 1 - (distanceToTop / viewportHeight);
        }

        progress = Math.max(0, Math.min(1, progress));

        const overlay = card.querySelector('.card-overlay') as HTMLElement;
        const content = card.querySelector('.card-content') as HTMLElement;

        if (progress > 0) {
          const scale = 1 - (progress * 0.1); 
          const overlayOpacity = progress * 0.8;
          const translateY = -(progress * 50);

          card.style.transform = `scale(${scale})`;
          
          if (overlay) overlay.style.opacity = `${overlayOpacity}`;
          if (content) content.style.transform = `translateY(${translateY}px)`;
        } else {
          card.style.transform = 'scale(1)';
          if (overlay) overlay.style.opacity = '0';
          if (content) content.style.transform = 'translateY(0px)';
        }
      });

      requestAnimationFrameId = requestAnimationFrame(handleScroll);
    };

    const onScroll = () => {
      if (requestAnimationFrameId) cancelAnimationFrame(requestAnimationFrameId);
      requestAnimationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (requestAnimationFrameId) cancelAnimationFrame(requestAnimationFrameId);
    };
  }, []);

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
    <section id="albuns" className="bg-background">
      {/* Section Header */}
      <div className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-6 text-center">
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
          <div className="mt-8 text-muted-foreground/50 text-sm animate-pulse">
            Role para explorar ↓
          </div>
        </div>
      </div>

      {/* Sticky Stack Categories */}
      <main className="relative w-full h-auto">
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            index={index}
            total={categories.length}
            albumCount={albumCounts[category.id] || 0}
            setRef={setRef}
          />
        ))}
      </main>
    </section>
  );
};

export default Gallery;

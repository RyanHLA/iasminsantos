import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Calendar, Images } from "lucide-react";
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

const categoryData: Record<string, { title: string; image: string; description: string }> = {
  casamentos: { title: "Casamentos", image: casamentoImg, description: "O grande dia eternizado com emoção e delicadeza" },
  gestantes: { title: "Gestantes", image: gestanteImg, description: "A espera mais doce registrada em cada detalhe" },
  "15-anos": { title: "15 Anos", image: quinzeImg, description: "Celebrando a transição para uma nova fase" },
  "pre-wedding": { title: "Pré-Wedding", image: preweddingImg, description: "O amor do casal antes do grande dia" },
  externo: { title: "Externo", image: externoImg, description: "Retratos ao ar livre com luz natural" },
  eventos: { title: "Eventos", image: eventosImg, description: "Momentos especiais em celebrações únicas" },
};

const CategoryAlbums = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (!category) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Categoria não encontrada.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Banner */}
        <div className="relative h-64 overflow-hidden md:h-80">
          <img
            src={category.image}
            alt={category.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-soft-black/60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="mb-2 font-sans text-sm uppercase tracking-[0.25em] text-gold">
              Portfólio
            </p>
            <h1 className="font-serif text-3xl font-normal text-primary-foreground md:text-4xl lg:text-5xl">
              {category.title}
            </h1>
            <p className="mx-auto mt-4 max-w-md px-4 font-sans text-sm font-light text-primary-foreground/80">
              {category.description}
            </p>
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
              <span className="text-foreground">{category.title}</span>
            </div>

            {/* Back button */}
            <button
              onClick={() => navigate("/#albuns")}
              className="mb-8 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </button>

            {loading ? (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">Carregando álbuns...</p>
              </div>
            ) : albums.length === 0 ? (
              <div className="py-16 text-center">
                <Images className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Nenhum álbum publicado nesta categoria ainda.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {albums.map((album) => (
                  <Link
                    key={album.id}
                    to={`/album/${album.id}`}
                    className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-gold/30 hover:shadow-lg"
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
                  </Link>
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

export default CategoryAlbums;

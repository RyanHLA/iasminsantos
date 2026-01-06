import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import photographerImgFallback from "@/assets/photographer-portrait.jpg";

const About = () => {
  const [photographerImg, setPhotographerImg] = useState<string>(photographerImgFallback);

  useEffect(() => {
    const fetchAboutImage = async () => {
      const { data } = await supabase
        .from('site_images')
        .select('image_url')
        .eq('section', 'about')
        .maybeSingle();

      if (data?.image_url) {
        setPhotographerImg(data.image_url);
      }
    };

    fetchAboutImage();
  }, []);

  return (
    <section id="sobre" className="section-padding bg-secondary">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="relative">
            <div className="relative overflow-hidden">
              <img
                src={photographerImg}
                alt="Iasmin Santos - Fotógrafa"
                className="aspect-[3/4] w-full object-cover shadow-medium"
              />
              {/* Decorative Frame */}
              <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full border-2 border-gold/30" />
            </div>
          </div>

          {/* Content */}
          <div className="lg:pl-4">
            <p className="mb-3 font-sans text-sm uppercase tracking-[0.25em] text-gold">
              Conheça
            </p>
            <h2 className="font-serif text-3xl font-normal text-foreground md:text-4xl">
              Iasmin Santos
            </h2>
            <div className="mt-4 h-[1px] w-16 bg-gold/50" />

            <div className="mt-8 space-y-5 font-sans text-base font-light leading-relaxed text-muted-foreground">
              <p>
                Há mais de 8 anos, dedico minha vida a eternizar momentos únicos. 
                Acredito que cada história merece ser contada com sensibilidade, 
                autenticidade e muito carinho.
              </p>
              <p>
                Minha abordagem fotográfica busca capturar a essência de cada pessoa, 
                cada sorriso espontâneo, cada lágrima de emoção. Trabalho com luz 
                natural sempre que possível, criando imagens atemporais que 
                transcendem tendências.
              </p>
              <p>
                Para mim, fotografar não é apenas um trabalho — é uma forma de 
                celebrar a vida, o amor e as conexões humanas. Cada sessão é única, 
                assim como cada pessoa que escolhe compartilhar seus momentos comigo.
              </p>
            </div>

            {/* Signature */}
            <div className="mt-10">
              <p className="font-serif text-xl italic text-foreground">
                "Cada foto conta uma história de amor"
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="h-[1px] w-8 bg-gold" />
                <span className="font-sans text-sm tracking-wide text-muted-foreground">
                  Iasmin Santos
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

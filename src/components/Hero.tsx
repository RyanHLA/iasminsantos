import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import heroImageFallback from "@/assets/hero-wedding.jpg";

const Hero = () => {
  const [heroImage, setHeroImage] = useState<string>(heroImageFallback);

  useEffect(() => {
    const fetchHeroImage = async () => {
      const { data } = await supabase
        .from('site_images')
        .select('image_url')
        .eq('section', 'hero')
        .maybeSingle();

      if (data?.image_url) {
        setHeroImage(data.image_url);
      }
    };

    fetchHeroImage();
  }, []);

  const scrollToContact = () => {
    const element = document.getElementById("contato");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Fotografia de casamento por Iasmin Santos"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-soft-black/30 via-soft-black/20 to-soft-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="animate-fade-in mb-4 font-sans text-sm uppercase tracking-[0.3em] text-primary-foreground/90">
          Fotografia com Emoção
        </p>
        
        <h1 className="animate-fade-in font-serif text-4xl font-light leading-tight text-primary-foreground md:text-5xl lg:text-6xl xl:text-7xl">
          Iasmin Santos
        </h1>
        
        <p className="animate-fade-in-delay mt-6 max-w-xl font-sans text-base font-light leading-relaxed text-primary-foreground/85 md:text-lg">
          Eternizando momentos únicos através de olhares, sorrisos e histórias de amor
        </p>

        <Button
          variant="hero"
          onClick={scrollToContact}
          className="animate-fade-in-delay-2 mt-10"
        >
          Solicite um Orçamento
        </Button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in-delay-3">
        <div className="flex flex-col items-center gap-2">
          <span className="font-sans text-xs uppercase tracking-widest text-primary-foreground/60">
            Explore
          </span>
          <div className="h-12 w-[1px] bg-gradient-to-b from-primary-foreground/40 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default Hero;

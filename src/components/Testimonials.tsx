import { Quote } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  service: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "A Iasmin capturou nossa essência como casal. Cada foto transmite exatamente o que sentimos naquele dia mágico.",
    author: "Marina & Rafael",
    service: "Casamento",
  },
  {
    quote:
      "Profissional incrível! Me senti linda e confortável durante todo o ensaio. As fotos ficaram emocionantes.",
    author: "Juliana M.",
    service: "Gestante",
  },
  {
    quote:
      "Minha filha amou cada momento do ensaio. As fotos superaram todas as nossas expectativas!",
    author: "Carla S.",
    service: "15 Anos",
  },
  {
    quote:
      "A delicadeza e o carinho da Iasmin fizeram toda a diferença. Recomendo de olhos fechados!",
    author: "Amanda & Pedro",
    service: "Pré-Wedding",
  },
];

const Testimonials = () => {
  return (
    <section id="depoimentos" className="section-padding bg-secondary">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 font-sans text-sm uppercase tracking-[0.25em] text-gold">
            O Que Dizem
          </p>
          <h2 className="font-serif text-3xl font-normal text-foreground md:text-4xl lg:text-5xl">
            Depoimentos
          </h2>
          <div className="mx-auto mt-6 h-[1px] w-16 bg-gold/50" />
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-card p-8 shadow-soft transition-all duration-300 hover:shadow-medium"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8">
                <div className="flex h-8 w-8 items-center justify-center bg-gold text-primary-foreground">
                  <Quote className="h-4 w-4" />
                </div>
              </div>

              {/* Quote */}
              <blockquote className="mb-6 pt-4 font-serif text-lg font-light italic leading-relaxed text-foreground">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-8 bg-gold" />
                <div>
                  <p className="font-sans text-sm font-medium text-foreground">
                    {testimonial.author}
                  </p>
                  <p className="font-sans text-xs text-muted-foreground">
                    {testimonial.service}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

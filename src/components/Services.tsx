import { Camera, Heart, Sparkles, Users } from "lucide-react";

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const services: Service[] = [
  {
    icon: <Heart className="h-8 w-8" />,
    title: "Casamentos",
    description:
      "Cobertura completa do seu grande dia, desde os preparativos até a festa. Capturo cada emoção, cada detalhe e cada momento especial para que você reviva eternamente.",
  },
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: "Gestantes",
    description:
      "Ensaios delicados que celebram a maternidade em toda sua beleza. Sessões personalizadas em estúdio ou ao ar livre, com figurino e produção impecáveis.",
  },
  {
    icon: <Camera className="h-8 w-8" />,
    title: "15 Anos",
    description:
      "Ensaios fotográficos que marcam essa fase tão especial. Produções elaboradas que realçam a personalidade e beleza de cada debutante.",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Pré-Wedding",
    description:
      "Sessões românticas para celebrar o amor antes do grande dia. Locações especiais, luz natural e muita cumplicidade registrada em cada clique.",
  },
];

const Services = () => {
  return (
    <section id="servicos" className="section-padding bg-background">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 font-sans text-sm uppercase tracking-[0.25em] text-gold">
            O Que Ofereço
          </p>
          <h2 className="font-serif text-3xl font-normal text-foreground md:text-4xl lg:text-5xl">
            Serviços
          </h2>
          <div className="mx-auto mt-6 h-[1px] w-16 bg-gold/50" />
          <p className="mx-auto mt-6 max-w-lg font-sans text-base font-light leading-relaxed text-muted-foreground">
            Cada serviço é personalizado de acordo com suas necessidades e sonhos
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative border border-border bg-card p-8 transition-all duration-500 hover:border-gold/50 hover:shadow-soft"
            >
              {/* Icon */}
              <div className="mb-6 inline-flex text-gold transition-transform duration-300 group-hover:scale-110">
                {service.icon}
              </div>

              {/* Content */}
              <h3 className="mb-4 font-serif text-xl font-medium text-foreground">
                {service.title}
              </h3>
              <p className="font-sans text-sm font-light leading-relaxed text-muted-foreground">
                {service.description}
              </p>

              {/* Decorative Corner */}
              <div className="absolute bottom-0 right-0 h-12 w-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute bottom-0 right-0 h-full w-[1px] bg-gradient-to-t from-gold to-transparent" />
                <div className="absolute bottom-0 right-0 h-[1px] w-full bg-gradient-to-l from-gold to-transparent" />
              </div>
            </div>
          ))}
        </div>

        {/* Additional Services Note */}
        <div className="mt-12 text-center">
          <p className="font-sans text-sm text-muted-foreground">
            Também realizo ensaios externos, cobertura de eventos e projetos personalizados.
          </p>
          <p className="mt-2 font-sans text-sm text-muted-foreground">
            <span className="text-gold">Entre em contato</span> para discutirmos suas ideias.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Services;

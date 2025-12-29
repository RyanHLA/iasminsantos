import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Mensagem enviada!",
      description: "Obrigada pelo contato. Retornarei em breve!",
    });

    setFormData({
      name: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    });
    setIsSubmitting(false);
  };

  return (
    <section id="contato" className="section-padding bg-background">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 font-sans text-sm uppercase tracking-[0.25em] text-gold">
            Vamos Conversar
          </p>
          <h2 className="font-serif text-3xl font-normal text-foreground md:text-4xl lg:text-5xl">
            Contato
          </h2>
          <div className="mx-auto mt-6 h-[1px] w-16 bg-gold/50" />
          <p className="mx-auto mt-6 max-w-lg font-sans text-base font-light leading-relaxed text-muted-foreground">
            Ficarei feliz em conhecer sua história e criar memórias inesquecíveis juntos
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-5">
          {/* Contact Info */}
          <div className="space-y-8 lg:col-span-2">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-gold/30 text-gold">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-sans text-sm font-medium text-foreground">Email</h4>
                <p className="mt-1 font-sans text-sm text-muted-foreground">
                  contato@iasminsantos.com.br
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-gold/30 text-gold">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-sans text-sm font-medium text-foreground">Telefone</h4>
                <p className="mt-1 font-sans text-sm text-muted-foreground">
                  (11) 99999-9999
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-gold/30 text-gold">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-sans text-sm font-medium text-foreground">Localização</h4>
                <p className="mt-1 font-sans text-sm text-muted-foreground">
                  São Paulo, SP
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-gold/30 text-gold">
                <Instagram className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-sans text-sm font-medium text-foreground">Instagram</h4>
                <p className="mt-1 font-sans text-sm text-muted-foreground">
                  @iasminsantosfotografia
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block font-sans text-sm text-foreground"
                  >
                    Nome *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-border bg-card px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none transition-colors"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block font-sans text-sm text-foreground"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-border bg-card px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block font-sans text-sm text-foreground"
                  >
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-border bg-card px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none transition-colors"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label
                    htmlFor="service"
                    className="mb-2 block font-sans text-sm text-foreground"
                  >
                    Serviço de Interesse
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full border border-border bg-card px-4 py-3 font-sans text-sm text-foreground focus:border-gold focus:outline-none transition-colors"
                  >
                    <option value="">Selecione...</option>
                    <option value="casamento">Casamento</option>
                    <option value="gestante">Gestante</option>
                    <option value="15-anos">15 Anos</option>
                    <option value="pre-wedding">Pré-Wedding</option>
                    <option value="externo">Externo</option>
                    <option value="eventos">Eventos</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block font-sans text-sm text-foreground"
                >
                  Mensagem *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full resize-none border border-border bg-card px-4 py-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none transition-colors"
                  placeholder="Conte-me sobre o seu evento ou ensaio..."
                />
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Enviando..." : "Solicite um Orçamento"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

import { Instagram, Mail, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-8">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="font-serif text-2xl font-medium text-foreground transition-opacity hover:opacity-70"
          >
            Iasmin Santos
          </a>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-gold"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="mailto:contato@iasminsantos.com.br"
              className="text-muted-foreground transition-colors hover:text-gold"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>

          {/* Divider */}
          <div className="h-[1px] w-16 bg-border" />

          {/* Copyright */}
          <div className="text-center">
            <p className="font-sans text-sm text-muted-foreground">
              © {currentYear} Iasmin Santos Fotografia. Todos os direitos reservados.
            </p>
            <p className="mt-2 flex items-center justify-center gap-1 font-sans text-xs text-muted-foreground">
              Feito com <Heart className="h-3 w-3 text-gold" /> no Brasil
            </p>
            {/* Discrete admin link */}
            <a
              href="/auth"
              className="mt-4 inline-block font-sans text-xs text-muted-foreground/50 transition-colors hover:text-muted-foreground"
            >
              Área Administrativa
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

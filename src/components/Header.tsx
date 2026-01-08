import { useState, useEffect } from "react";
import { Menu, X, Camera, ArrowRight } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#galeria", label: "Galeria" },
    { href: "#sobre", label: "Sobre" },
    { href: "#servicos", label: "Serviços" },
    { href: "#depoimentos", label: "Depoimentos" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 py-4">
      <nav
        className={`flex w-full max-w-2xl items-center justify-between rounded-full border px-5 py-3 transition-all duration-500 ${
          scrolled
            ? "border-white/20 bg-soft-black/80 shadow-2xl shadow-black/30 backdrop-blur-xl"
            : "border-white/10 bg-soft-black/50 backdrop-blur-md"
        }`}
      >
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2 font-serif text-lg font-medium tracking-wide text-primary-foreground transition-opacity hover:opacity-80"
        >
          <span className="text-gold">
            <Camera size={18} />
          </span>
          Iasmin Santos
        </a>

        {/* Desktop Navigation */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="group relative px-3 py-2 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
              >
                {link.label}
                <span className="absolute bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-gold transition-all duration-300 group-hover:w-1/2" />
              </a>
            </li>
          ))}
        </ul>

        {/* Contact Button */}
        <a
          href="#contato"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("#contato");
          }}
          className="group hidden items-center gap-2 rounded-full bg-gold/90 px-4 py-2 text-sm font-medium text-soft-black transition-all hover:bg-gold hover:gap-3 md:flex"
        >
          Contato
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </a>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-primary-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute left-4 right-4 top-full mt-2 rounded-2xl border border-white/10 bg-soft-black/95 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col items-center gap-4 py-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className="text-sm text-primary-foreground/80 transition-colors hover:text-gold"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contato"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("#contato");
                }}
                className="flex items-center gap-2 rounded-full bg-gold/90 px-4 py-2 text-sm font-medium text-soft-black"
              >
                Contato
                <ArrowRight size={14} />
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;

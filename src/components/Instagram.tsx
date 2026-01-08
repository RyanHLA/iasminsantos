import { useEffect } from "react";
import { Instagram as InstagramIcon } from "lucide-react";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

const Instagram = () => {
  useEffect(() => {
    // Load Instagram embed script
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <InstagramIcon className="w-8 h-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-serif text-foreground">
              Siga no Instagram
            </h2>
          </div>
          <a
            href="https://instagram.com/iasminsantosfotografia"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors text-lg"
          >
            @iasminsantosfotografia
          </a>
        </div>

        {/* Instagram Profile Embed */}
        <div className="flex justify-center">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink="https://www.instagram.com/iasminsantosfotografia/"
            data-instgrm-version="14"
            style={{
              background: "#FFF",
              border: 0,
              borderRadius: "3px",
              boxShadow: "0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)",
              margin: "1px",
              maxWidth: "540px",
              minWidth: "326px",
              padding: 0,
              width: "calc(100% - 2px)",
            }}
          >
            <div style={{ padding: "16px" }}>
              <a
                href="https://www.instagram.com/iasminsantosfotografia/"
                style={{
                  background: "#FFFFFF",
                  lineHeight: 0,
                  padding: "0 0",
                  textAlign: "center",
                  textDecoration: "none",
                  width: "100%",
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Carregando Instagram...
              </a>
            </div>
          </blockquote>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <a
            href="https://instagram.com/iasminsantosfotografia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium"
          >
            <InstagramIcon className="w-5 h-5" />
            Seguir no Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default Instagram;

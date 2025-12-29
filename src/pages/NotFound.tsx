import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="text-center">
        <h1 className="font-serif text-6xl font-light text-foreground md:text-7xl">404</h1>
        <p className="mt-4 font-sans text-xl text-muted-foreground">
          Página não encontrada
        </p>
        <p className="mt-2 font-sans text-sm text-muted-foreground">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Button asChild variant="gold" className="mt-8">
          <a href="/">Voltar ao Início</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

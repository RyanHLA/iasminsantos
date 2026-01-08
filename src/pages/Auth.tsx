import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Lock } from 'lucide-react';

const Auth = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAdmin, loading, verifyPin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await verifyPin(pin);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error || 'PIN incorreto.');
      setPin('');
    }

    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
            <Lock className="h-8 w-8 text-gold" />
          </div>
          <h1 className="font-serif text-3xl font-normal text-foreground">
            Área Administrativa
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Digite o PIN para acessar
          </p>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Digite o PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="h-12 text-center text-lg tracking-widest"
            autoFocus
          />
          
          <Button
            type="submit"
            disabled={isLoading || !pin}
            className="w-full h-12 bg-gold hover:bg-gold/90 text-white"
          >
            {isLoading ? 'Verificando...' : 'Entrar'}
          </Button>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive text-center">
              {error}
            </div>
          )}
        </form>

        {/* Back to site link */}
        <div className="text-center">
          <a
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-gold"
          >
            ← Voltar ao site
          </a>
        </div>
      </div>
    </div>
  );
};

export default Auth;

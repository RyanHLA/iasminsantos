import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  isAdmin: boolean;
  loading: boolean;
  verifyPin: (pin: string) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => void;
}

const AUTH_STORAGE_KEY = 'admin_authenticated';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated in this session
    const authenticated = sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    setIsAdmin(authenticated);
    setLoading(false);
  }, []);

  const verifyPin = async (pin: string): Promise<{ success: boolean; error: string | null }> => {
    try {
      const { data: isValid, error } = await supabase.rpc('verify_admin_pin', {
        pin_attempt: pin
      });

      if (error) {
        return { success: false, error: 'Erro ao verificar PIN. Tente novamente.' };
      }

      if (isValid) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
        setIsAdmin(true);
        return { success: true, error: null };
      }

      return { success: false, error: 'PIN incorreto.' };
    } catch {
      return { success: false, error: 'Erro inesperado. Tente novamente.' };
    }
  };

  const signOut = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loading, verifyPin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

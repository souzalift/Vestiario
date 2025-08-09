// contexts/AuthContext.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(
        '🔐 Estado de autenticação mudou:',
        user ? 'Logado' : 'Deslogado',
      );
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Erro no login com Google:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Login cancelado pelo usuário');
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Erro no registro:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

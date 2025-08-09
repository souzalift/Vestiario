// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: Date;
  lastLogin: Date;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar perfil do usuário no Firestore
  const fetchUserProfile = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          phone: data.phone || '',
          address: data.address || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: new Date(),
          emailVerified: user.emailVerified,
        });

        // Atualizar último login
        await updateDoc(doc(db, 'users', user.uid), {
          lastLogin: new Date(),
          emailVerified: user.emailVerified,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  // Criar perfil no Firestore
  const createUserProfile = async (user: User, additionalData?: any) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = new Date();

      try {
        await setDoc(userRef, {
          displayName,
          email,
          photoURL,
          phone: '',
          address: null,
          createdAt,
          lastLogin: createdAt,
          emailVerified: user.emailVerified,
          ...additionalData,
        });
      } catch (error) {
        console.error('Erro ao criar perfil:', error);
        throw error;
      }
    }
  };

  // Login com email e senha
  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createUserProfile(result.user);
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('Email não encontrado');
        case 'auth/wrong-password':
          throw new Error('Senha incorreta');
        case 'auth/invalid-email':
          throw new Error('Email inválido');
        case 'auth/user-disabled':
          throw new Error('Conta desabilitada');
        default:
          throw new Error('Erro ao fazer login');
      }
    }
  };

  // Registro
  const register = async (email: string, password: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualizar perfil com nome
      await updateProfile(result.user, { displayName: name });
      
      // Criar perfil no Firestore
      await createUserProfile(result.user, { displayName: name });
      
      // Enviar email de verificação
      await sendEmailVerification(result.user);
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('Este email já está em uso');
        case 'auth/weak-password':
          throw new Error('Senha muito fraca (mínimo 6 caracteres)');
        case 'auth/invalid-email':
          throw new Error('Email inválido');
        default:
          throw new Error('Erro ao criar conta');
      }
    }
  };

  // Login com Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createUserProfile(result.user);
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          throw new Error('Login cancelado pelo usuário');
        case 'auth/popup-blocked':
          throw new Error('Popup bloqueado pelo navegador');
        default:
          throw new Error('Erro ao fazer login com Google');
      }
    }
  };

  // Logout - Implementação completa
  const logout = async () => {
    try {
      // Limpar dados locais primeiro
      setUser(null);
      setUserProfile(null);
      
      // Limpar localStorage (carrinho, preferências, etc.)
      localStorage.removeItem('carrinho');
      localStorage.removeItem('user_preferences');
      localStorage.removeItem('recent_searches');
      
      // Fazer logout no Firebase
      await signOut(auth);
      
      // Dispatch evento customizado para outros componentes
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw new Error('Erro ao sair da conta');
    }
  };

  // Reset de senha
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('Email não encontrado');
        case 'auth/invalid-email':
          throw new Error('Email inválido');
        default:
          throw new Error('Erro ao enviar email de recuperação');
      }
    }
  };

  // Enviar email de verificação
  const sendVerificationEmail = async () => {
    if (!user) return;
    
    try {
      await sendEmailVerification(user);
    } catch (error) {
      console.error('Erro ao enviar email de verificação:', error);
      throw new Error('Erro ao enviar email de verificação');
    }
  };

  // Atualizar perfil
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date(),
      });
      
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw new Error('Erro ao atualizar perfil');
    }
  };

  // Observer do estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      
      if (user) {
        setUser(user);
        await fetchUserProfile(user);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    resetPassword,
    loginWithGoogle,
    updateUserProfile,
    sendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

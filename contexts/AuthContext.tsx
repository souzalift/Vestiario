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

  // Login com email e senha - ATUALIZADO
  const login = async (email: string, password: string) => {
    try {
      // Validar inputs antes de enviar
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }

      if (!email.includes('@')) {
        throw new Error('Email inválido');
      }

      console.log('Tentando fazer login com:', email);

      const result = await signInWithEmailAndPassword(auth, email, password);

      console.log('Login bem-sucedido:', result.user.uid);
      await createUserProfile(result.user);
    } catch (error: any) {
      console.error('Erro no login:', error);

      // Tratar erros específicos do Firebase v9+
      switch (error.code) {
        case 'auth/invalid-credential':
          throw new Error('Email ou senha incorretos');
        case 'auth/user-not-found':
          throw new Error('Usuário não encontrado');
        case 'auth/wrong-password':
          throw new Error('Senha incorreta');
        case 'auth/invalid-email':
          throw new Error('Email inválido');
        case 'auth/user-disabled':
          throw new Error('Conta desabilitada');
        case 'auth/too-many-requests':
          throw new Error('Muitas tentativas. Tente novamente mais tarde');
        case 'auth/network-request-failed':
          throw new Error('Erro de conexão. Verifique sua internet');
        case 'auth/operation-not-allowed':
          throw new Error('Login com email/senha não habilitado');
        case 'auth/weak-password':
          throw new Error('Senha muito fraca');
        default:
          // Para erros não mapeados, mostrar mensagem genérica
          throw new Error('Erro ao fazer login. Verifique suas credenciais');
      }
    }
  };

  // Registro - MELHORADO
  const register = async (email: string, password: string, name: string) => {
    try {
      // Validações
      if (!email || !password || !name) {
        throw new Error('Todos os campos são obrigatórios');
      }

      if (!email.includes('@')) {
        throw new Error('Email inválido');
      }

      if (password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }

      if (name.trim().length < 2) {
        throw new Error('Nome deve ter pelo menos 2 caracteres');
      }

      console.log('Criando conta para:', email);

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Atualizar perfil com nome
      await updateProfile(result.user, { displayName: name.trim() });

      // Criar perfil no Firestore
      await createUserProfile(result.user, { displayName: name.trim() });

      // Enviar email de verificação
      try {
        await sendEmailVerification(result.user);
        console.log('Email de verificação enviado');
      } catch (verifyError) {
        console.warn('Erro ao enviar email de verificação:', verifyError);
        // Não bloquear o registro se o email falhar
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);

      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('Este email já está em uso');
        case 'auth/weak-password':
          throw new Error('Senha muito fraca (mínimo 6 caracteres)');
        case 'auth/invalid-email':
          throw new Error('Email inválido');
        case 'auth/operation-not-allowed':
          throw new Error('Criação de conta não habilitada');
        case 'auth/network-request-failed':
          throw new Error('Erro de conexão. Verifique sua internet');
        default:
          // Se já é uma mensagem customizada nossa, manter
          if (
            error.message.includes('obrigatórios') ||
            error.message.includes('caracteres') ||
            error.message.includes('inválido')
          ) {
            throw error;
          }
          throw new Error('Erro ao criar conta');
      }
    }
  };

  // Login com Google - MELHORADO
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();

      // Configurar parâmetros do Google
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      console.log('Iniciando login com Google...');

      const result = await signInWithPopup(auth, provider);

      console.log('Login com Google bem-sucedido:', result.user.uid);
      await createUserProfile(result.user);
    } catch (error: any) {
      console.error('Erro no login com Google:', error);

      switch (error.code) {
        case 'auth/popup-closed-by-user':
          throw new Error('Login cancelado pelo usuário');
        case 'auth/popup-blocked':
          throw new Error(
            'Popup bloqueado pelo navegador. Permita popups e tente novamente',
          );
        case 'auth/cancelled-popup-request':
          throw new Error('Operação cancelada');
        case 'auth/network-request-failed':
          throw new Error('Erro de conexão. Verifique sua internet');
        case 'auth/too-many-requests':
          throw new Error('Muitas tentativas. Tente novamente mais tarde');
        default:
          throw new Error('Erro ao fazer login com Google');
      }
    }
  };

  // Logout - Implementação completa
  const logout = async () => {
    try {
      console.log('Iniciando logout...');

      // Limpar dados locais primeiro
      setUser(null);
      setUserProfile(null);

      // Limpar localStorage (carrinho, preferências, etc.)
      try {
        localStorage.removeItem('carrinho');
        localStorage.removeItem('user_preferences');
        localStorage.removeItem('recent_searches');
      } catch (localStorageError) {
        console.warn('Erro ao limpar localStorage:', localStorageError);
      }

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

  // Reset de senha - MELHORADO
  const resetPassword = async (email: string) => {
    try {
      if (!email || !email.includes('@')) {
        throw new Error('Email inválido');
      }

      await sendPasswordResetEmail(auth, email);
      console.log('Email de recuperação enviado para:', email);
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);

      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('Email não encontrado');
        case 'auth/invalid-email':
          throw new Error('Email inválido');
        case 'auth/too-many-requests':
          throw new Error('Muitas tentativas. Tente novamente mais tarde');
        case 'auth/network-request-failed':
          throw new Error('Erro de conexão. Verifique sua internet');
        default:
          throw new Error('Erro ao enviar email de recuperação');
      }
    }
  };

  // Enviar email de verificação
  const sendVerificationEmail = async () => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      await sendEmailVerification(user);
      console.log('Email de verificação enviado');
    } catch (error: any) {
      console.error('Erro ao enviar email de verificação:', error);

      switch (error.code) {
        case 'auth/too-many-requests':
          throw new Error('Muitas tentativas. Tente novamente mais tarde');
        case 'auth/network-request-failed':
          throw new Error('Erro de conexão. Verifique sua internet');
        default:
          throw new Error('Erro ao enviar email de verificação');
      }
    }
  };

  // Atualizar perfil
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date(),
      });

      setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
      console.log('Perfil atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw new Error('Erro ao atualizar perfil');
    }
  };

  // Observer do estado de autenticação
  useEffect(() => {
    console.log('Inicializando observador de autenticação...');

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(
        'Estado de autenticação mudou:',
        user ? user.uid : 'não logado',
      );
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

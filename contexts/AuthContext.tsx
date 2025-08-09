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
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { toast } from 'sonner';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  firstName?: string;
  lastName?: string;
  photoURL: string | null;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferences?: {
    newsletter?: boolean;
    notifications?: boolean;
    favoriteTeams?: string[];
  };
  role?: 'user' | 'admin';
  createdAt: any;
  updatedAt: any;
  lastLoginAt?: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (
    email: string,
    password: string,
    userData?: Partial<UserProfile>,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar perfil do usuário do Firestore
  const loadUserProfile = async (userId: string) => {
    try {
      console.log('👤 Carregando perfil do usuário:', userId);

      const userDoc = await getDoc(doc(db, 'users', userId));

      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        setUserProfile(profileData);
        console.log(
          '✅ Perfil carregado:',
          profileData.displayName || profileData.email,
        );
      } else {
        console.log('⚠️ Perfil não encontrado, será criado no próximo login');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
      setUserProfile(null);
    }
  };

  // Criar ou atualizar perfil do usuário
  const createOrUpdateUserProfile = async (
    user: User,
    additionalData?: Partial<UserProfile>,
  ) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      const baseProfile: Partial<UserProfile> = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName,
        photoURL: user.photoURL,
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };

      if (userDoc.exists()) {
        // Atualizar perfil existente
        await updateDoc(userRef, {
          ...baseProfile,
          ...additionalData,
        });
        console.log('✅ Perfil atualizado para:', user.email);
      } else {
        // Criar novo perfil
        const newProfile: UserProfile = {
          ...baseProfile,
          firstName: additionalData?.firstName || '',
          lastName: additionalData?.lastName || '',
          phoneNumber: '',
          address: {},
          preferences: {
            newsletter: true,
            notifications: true,
            favoriteTeams: [],
          },
          role: 'user',
          createdAt: serverTimestamp(),
        } as UserProfile;

        await setDoc(userRef, newProfile);
        console.log('✅ Novo perfil criado para:', user.email);
      }

      // Recarregar perfil
      await loadUserProfile(user.uid);
    } catch (error) {
      console.error('❌ Erro ao criar/atualizar perfil:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(
        '🔐 Estado de autenticação mudou:',
        user ? 'Logado' : 'Deslogado',
      );

      setUser(user);

      if (user) {
        // Usuário logado - carregar perfil
        await loadUserProfile(user.uid);
      } else {
        // Usuário deslogado - limpar perfil
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Atualizar último login
      await createOrUpdateUserProfile(result.user);
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

      const result = await signInWithPopup(auth, provider);

      // Criar/atualizar perfil com dados do Google
      await createOrUpdateUserProfile(result.user, {
        firstName: result.user.displayName?.split(' ')[0] || '',
        lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
      });
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

  const register = async (
    email: string,
    password: string,
    userData?: Partial<UserProfile>,
  ) => {
    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Atualizar nome no perfil do Firebase Auth se fornecido
      if (userData?.firstName) {
        const displayName = `${userData.firstName} ${
          userData.lastName || ''
        }`.trim();
        await updateProfile(result.user, { displayName });
      }

      // Criar perfil completo no Firestore
      await createOrUpdateUserProfile(result.user, userData);
    } catch (error: any) {
      console.error('Erro no registro:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('Usuário não está logado');
    }

    try {
      const userRef = doc(db, 'users', user.uid);

      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      // Atualizar nome no Firebase Auth se necessário
      if (data.displayName && data.displayName !== user.displayName) {
        await updateProfile(user, { displayName: data.displayName });
      }

      // Recarregar perfil
      await loadUserProfile(user.uid);

      console.log('✅ Perfil atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await loadUserProfile(user.uid);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error: any) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUserProfile,
    refreshUserProfile,
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

// Hook específico para acessar o perfil do usuário
export function useUserProfile() {
  const { userProfile, updateUserProfile, refreshUserProfile } = useAuth();
  return { userProfile, updateUserProfile, refreshUserProfile };
}

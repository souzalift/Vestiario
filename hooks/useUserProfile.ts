'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Interfaces
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
    number?: string; // Adicionado para número da casa
    complement?: string; // Adicionado para complemento
    neighborhood?: string; // Adicionado para bairro
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
  emailVerified?: boolean;
}

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  favoriteProducts: number;
  memberSince: string;
  totalItems: number;
  averageOrderValue: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  createdAt: any;
  status: string;
  total: number;
  items: Array<{
    productId: string;
    title: string;
    quantity: number;
    price: number;
  }>;
}

interface FavoriteProduct {
  id: string;
  productId: string;
  title: string;
  price: number;
  image: string;
  category: string;
  slug: string;
  addedAt: any;
}

// Interface para o produto do Firestore
interface ProductData {
  title: string;
  price: number;
  images?: string[];
  category: string;
  slug: string;
  description?: string;
  views?: number;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  createdAt?: any;
  updatedAt?: any;
}

export function UserProfile() {
  const { user, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Carregar perfil do usuário
  const loadUserProfile = async (userId: string) => {
    try {
      console.log('👤 Carregando perfil completo do usuário:', userId);

      const userDoc = await getDoc(doc(db, 'users', userId));

      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        setUserProfile(profileData);
        return profileData;
      } else {
        console.log('⚠️ Perfil não encontrado');
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
      return null;
    }
  };

  // Carregar estatísticas do usuário
  const loadUserStats = async (userId: string) => {
    try {
      // Buscar pedidos do usuário
      const ordersRef = collection(db, 'orders');
      const ordersQuery = query(
        ordersRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const ordersSnapshot = await getDocs(ordersQuery);

      let totalSpent = 0;
      let totalItems = 0;
      const orders: RecentOrder[] = [];

      ordersSnapshot.docs.forEach((docSnapshot) => {
        const orderData = docSnapshot.data();
        const order: RecentOrder = {
          id: docSnapshot.id,
          orderNumber: orderData.orderNumber || `ORD-${docSnapshot.id.substring(0, 8).toUpperCase()}`,
          createdAt: orderData.createdAt,
          status: orderData.status || 'pending',
          total: orderData.total || 0,
          items: orderData.items || [],
        };

        orders.push(order);
        totalSpent += order.total;
        totalItems += order.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      });

      // Buscar favoritos do usuário
      const favoritesRef = collection(db, 'favorites');
      const favoritesQuery = query(
        favoritesRef,
        where('userId', '==', userId),
        orderBy('addedAt', 'desc'),
        limit(6)
      );
      const favoritesSnapshot = await getDocs(favoritesQuery);

      const favorites: FavoriteProduct[] = [];

      for (const favoriteDoc of favoritesSnapshot.docs) {
        const favoriteData = favoriteDoc.data();

        // Buscar dados do produto
        try {
          const productDoc = await getDoc(doc(db, 'products', favoriteData.productId));
          if (productDoc.exists()) {
            // Tipar corretamente os dados do produto
            const productData = productDoc.data() as ProductData;

            favorites.push({
              id: favoriteDoc.id,
              productId: favoriteData.productId,
              title: productData.title || 'Produto sem nome',
              price: productData.price || 0,
              image: productData.images?.[0] || '/placeholder.jpg',
              category: productData.category || 'Sem categoria',
              slug: productData.slug || '',
              addedAt: favoriteData.addedAt,
            });
          } else {
            console.warn(`Produto ${favoriteData.productId} não encontrado`);
          }
        } catch (error) {
          console.warn('Erro ao carregar produto favorito:', favoriteData.productId, error);
        }
      }

      const stats: UserStats = {
        totalOrders: orders.length,
        totalSpent,
        favoriteProducts: favoritesSnapshot.size,
        memberSince: userProfile?.createdAt ?
          new Date(userProfile.createdAt.toDate()).getFullYear().toString() :
          new Date().getFullYear().toString(),
        totalItems,
        averageOrderValue: orders.length > 0 ? totalSpent / orders.length : 0,
      };

      setUserStats(stats);
      setRecentOrders(orders.slice(0, 3)); // Apenas os 3 mais recentes
      setFavoriteProducts(favorites);

      console.log(`✅ Estatísticas carregadas: ${orders.length} pedidos, ${favorites.length} favoritos`);

      return { stats, orders: orders.slice(0, 3), favorites };
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      return null;
    }
  };

  // Atualizar perfil do usuário
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) {
      throw new Error('Usuário não está logado');
    }

    try {
      setUpdating(true);
      console.log('📝 Atualizando perfil do usuário...');

      const userRef = doc(db, 'users', user.uid);

      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Recarregar perfil
      const updatedProfile = await loadUserProfile(user.uid);

      console.log('✅ Perfil atualizado com sucesso');
      return updatedProfile;
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  // Criar perfil inicial se não existir
  const createUserProfile = async (userData: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('Usuário não está logado');
    }

    try {
      console.log('🆕 Criando perfil inicial...');

      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName,
        photoURL: user.photoURL,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || {},
        preferences: {
          newsletter: true,
          notifications: true,
          favoriteTeams: [],
          ...userData.preferences,
        },
        role: 'user',
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', user.uid), newProfile);
      await loadUserProfile(user.uid);

      console.log('✅ Perfil criado com sucesso');
      return newProfile;
    } catch (error) {
      console.error('❌ Erro ao criar perfil:', error);
      throw error;
    }
  };

  // Atualizar preferências
  const updatePreferences = async (preferences: Partial<UserProfile['preferences']>) => {
    if (!userProfile) return;

    return updateUserProfile({
      preferences: {
        ...userProfile.preferences,
        ...preferences,
      },
    });
  };

  // Refresh completo dos dados
  const refreshUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('🔄 Atualizando dados do usuário...');
      await Promise.all([
        loadUserProfile(user.uid),
        loadUserStats(user.uid),
      ]);
      console.log('✅ Dados atualizados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar produto aos favoritos
  const addToFavorites = async (productId: string) => {
    if (!user) {
      throw new Error('Usuário não está logado');
    }

    try {
      const favoriteRef = doc(collection(db, 'favorites'));
      await setDoc(favoriteRef, {
        userId: user.uid,
        productId,
        addedAt: serverTimestamp(),
      });

      // Recarregar favoritos
      await loadUserStats(user.uid);
      console.log(`✅ Produto ${productId} adicionado aos favoritos`);
    } catch (error) {
      console.error('❌ Erro ao adicionar aos favoritos:', error);
      throw error;
    }
  };

  // Remover produto dos favoritos
  const removeFromFavorites = async (favoriteId: string) => {
    if (!user) {
      throw new Error('Usuário não está logado');
    }

    try {
      await deleteDoc(doc(db, 'favorites', favoriteId));

      // Recarregar favoritos
      await loadUserStats(user.uid);
      console.log(`✅ Favorito ${favoriteId} removido`);
    } catch (error) {
      console.error('❌ Erro ao remover favorito:', error);
      throw error;
    }
  };

  // Verificar se produto está nos favoritos
  const isProductFavorite = (productId: string): boolean => {
    return favoriteProducts.some(fav => fav.productId === productId);
  };

  // Verificar se é VIP (5 ou mais pedidos)
  const isVipMember = userStats ? userStats.totalOrders >= 5 : false;

  // Verificar se perfil está completo
  const isProfileComplete = userProfile ?
    !!(userProfile.firstName && userProfile.lastName && userProfile.phoneNumber) : false;

  // Effect principal para carregar dados quando usuário muda
  useEffect(() => {
    if (isAuthenticated && user) {
      const loadAllData = async () => {
        setLoading(true);
        try {
          console.log('🔄 Carregando dados do usuário...');
          const profile = await loadUserProfile(user.uid);
          if (profile) {
            await loadUserStats(user.uid);
          }
        } catch (error) {
          console.error('❌ Erro ao carregar dados:', error);
        } finally {
          setLoading(false);
        }
      };

      loadAllData();
    } else if (!isAuthenticated) {
      // Limpar dados quando usuário desloga
      console.log('🧹 Limpando dados do usuário (logout)');
      setUserProfile(null);
      setUserStats(null);
      setRecentOrders([]);
      setFavoriteProducts([]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  return {
    // Estados
    userProfile,
    userStats,
    recentOrders,
    favoriteProducts,
    loading,
    updating,

    // Flags úteis
    isVipMember,
    isProfileComplete,

    // Funções principais
    updateUserProfile,
    createUserProfile,
    updatePreferences,
    refreshUserData,
    loadUserProfile,
    loadUserStats,

    // Funções de favoritos
    addToFavorites,
    removeFromFavorites,
    isProductFavorite,
  };
}
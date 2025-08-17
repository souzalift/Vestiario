'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  recentOrders: any[];
  topProducts: any[];
  salesData: any[];
}

export const useAdmin = () => {
  const { userProfile, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authLoading) return;

      setLoading(true);

      try {
        if (!userProfile) {
          setIsAdmin(false);
          setIsLoaded(true);
          setLoading(false);
          return;
        }

        // Verificar se é admin através do userProfile ou email específico
        const adminCheck =
          userProfile?.role === 'admin' ||
          userProfile.email === 'admin@ovestiario.com' ||
          userProfile.email === 'souzalift@gmail.com';

        setIsAdmin(adminCheck);

        // Se for admin, carregar estatísticas
        if (adminCheck) {
          await loadAdminStats();
        }
      } catch (error) {
        console.error('Erro ao verificar admin:', error);
        setIsAdmin(false);
      } finally {
        setIsLoaded(true);
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [userProfile, authLoading]);

  const loadAdminStats = async () => {
    try {
      const stats: AdminStats = {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalUsers: 0,
        recentOrders: [],
        topProducts: [],
        salesData: [],
      };

      // Carregar produtos
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      stats.totalProducts = productsSnapshot.size;

      // Carregar usuários
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      stats.totalUsers = usersSnapshot.size;

      setAdminStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  return {
    isAdmin,
    isLoaded,
    loading,
    email: userProfile?.email || '',
    adminStats,
    loadAdminStats,
  };
};

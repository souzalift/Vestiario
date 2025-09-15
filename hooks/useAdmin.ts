// hooks/useAdmin.ts
'use client';

import { useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UseAdminResult {
  user: User | null;
  isAdmin: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export function useAdmin(): UseAdminResult {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      setUser(user);

      if (user) {
        try {
          // Verificar se o usuário tem permissão de admin
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();

          setIsAdmin(userData?.role === 'admin' || userData?.isAdmin === true);
        } catch (error) {
          console.error('Erro ao verificar permissões:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setIsLoaded(true);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  return { user, isAdmin, isLoaded, isLoading, signOut };
}
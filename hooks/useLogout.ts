'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useLogout() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async (redirectTo: string = '/') => {
    try {
      setIsLoggingOut(true);

      // Limpar dados locais se necessário
      localStorage.removeItem('carrinho');
      localStorage.removeItem('favoritos');
      localStorage.removeItem('wishlist');
      sessionStorage.clear();

      // Fazer logout no Clerk
      await signOut(() => {
        router.push(redirectTo);
        setIsLoggingOut(false);
      });

    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setIsLoggingOut(false);
    }
  };

  return {
    logout,
    isLoggingOut,
    user,
    isLoggedIn: !!user
  };
}
// contexts/FavoritesContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface FavoritesContextType {
  favorites: string[]; // Supondo que você armazena IDs dos produtos
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Carrega os favoritos do localStorage no início (apenas no cliente)
  useEffect(() => {
    try {
      const storedFavorites = JSON.parse(
        localStorage.getItem('favorites') || '[]',
      );
      setFavorites(storedFavorites);
    } catch (error) {
      console.error('Failed to parse favorites from localStorage', error);
      setFavorites([]);
    }
  }, []);

  // Salva os favoritos no localStorage sempre que eles mudam
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (productId: string) => {
    setFavorites((prev) => Array.from(new Set([...prev, productId])));
  };

  const removeFavorite = (productId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== productId));
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    favoritesCount: favorites.length,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

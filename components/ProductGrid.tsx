'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/services/products';

// Lista de ligas conhecidas
const LEAGUES = [
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Brasileirão',
  'Ligue 1',
];

import { useSearchParams } from 'next/navigation';

export default function ProductGrid() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const category =
    searchParams.get('team') || searchParams.get('league') || 'Todos';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        let url = '/api/products';
        const params = new URLSearchParams();

        if (searchQuery) {
          params.set('search', searchQuery);
        } else if (category && category !== 'Todos') {
          // Verifica se é uma liga ou um time
          const isLeague = LEAGUES.includes(category);

          if (isLeague) {
            params.set('league', category);
          } else {
            // É um time, busca por team
            params.set('team', category);
          }
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        console.log('Fetching from:', url);

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          // Mapear os dados da API para a interface Product correta
          const mappedProducts: Product[] = data.data.map((item: any) => ({
            id: item.id || item._id,
            title: item.title,
            description: item.description,
            price: item.price,
            images: item.images || [item.image].filter(Boolean),
            category: item.category || 'Sem categoria',
            sizes: item.sizes || [],
            featured: item.featured || false,
            tags: item.tags || [],
            brand: item.brand || '',
            league: item.league || '',
            season: item.season || '',
            playerName: item.playerName || '',
            playerNumber: item.playerNumber || '',
            slug: item.slug,
            views: item.views || 0,
            rating: item.rating || 0,
            reviewCount: item.reviewCount || 0,
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          }));

          setProducts(mappedProducts);
        } else {
          console.error('Failed to fetch products:', data.error);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, searchQuery]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm p-6 animate-pulse"
          >
            <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
            <div className="space-y-3">
              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              <div className="bg-gray-200 h-6 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⚽</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Nenhum produto encontrado
        </h3>
        <p className="text-gray-600">
          {category === 'Todos'
            ? 'Não há produtos disponíveis no momento.'
            : `Não há produtos disponíveis para ${category}.`}
        </p>
        {searchQuery && (
          <p className="text-gray-500 mt-2">Busca por: {searchQuery}</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.id || product.slug}
          product={product}
          onAddToCart={(product) => {
            // Implementar lógica do carrinho
            console.log('Adicionar ao carrinho:', product.title);
          }}
          onToggleFavorite={(product) => {
            // Implementar lógica de favoritos
            console.log('Toggle favorito:', product.title);
          }}
        />
      ))}
    </div>
  );
}

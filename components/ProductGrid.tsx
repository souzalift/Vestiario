'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  slug: string;
  league?: string;
  team?: string;
  categories?: string[];
}

interface ProductGridProps {
  category: string;
  searchQuery?: string;
}

// Lista de ligas conhecidas
const LEAGUES = [
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Brasileirão',
];

export default function ProductGrid({
  category,
  searchQuery = '',
}: ProductGridProps) {
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
          setProducts(data.data);
        } else {
          console.error('Failed to fetch products:', data.error);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, searchQuery]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-8">
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
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}

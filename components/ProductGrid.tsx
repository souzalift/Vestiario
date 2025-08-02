'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  league?: string;
  team?: string;
}

interface ProductGridProps {
  category: string;
}

export default function ProductGrid({ category }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Use 'league' instead of 'categoria' for the API call
        const url = category === 'Todos' 
          ? '/api/products' 
          : `/api/products?league=${encodeURIComponent(category)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.data);
        } else {
          console.error('Error fetching products:', data.error);
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
  }, [category]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="bg-gray-300 h-48 rounded mb-4"></div>
            <div className="bg-gray-300 h-4 rounded mb-2"></div>
            <div className="bg-gray-300 h-4 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Nenhum produto encontrado
        </h3>
        <p className="text-gray-500">
          {category === 'Todos' 
            ? 'Não há produtos disponíveis no momento.' 
            : `Não há produtos disponíveis para ${category}.`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

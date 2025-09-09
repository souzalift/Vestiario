'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFavorites } from '@/contexts/FavoritesContext';
import { getProductsByIds, Product } from '@/services/products';
import ProductCard from '@/components/ProductCard'; // O seu componente de cartão de produto
import { Loader2, Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function FavoritosPage() {
  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      if (favorites.length === 0) {
        setFavoriteProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const products = await getProductsByIds(favorites);
        setFavoriteProducts(products);
      } catch (error) {
        console.error('Erro ao carregar produtos favoritos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteProducts();
  }, [favorites]); // Recarrega sempre que a lista de favoritos mudar

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-heading text-gray-900 uppercase tracking-wider">
              Meus Favoritos
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              A sua lista de desejos pessoal. Os produtos que você ama, todos
              num só lugar.
            </p>
          </div>

          {favoriteProducts.length === 0 ? (
            <Card className="text-center max-w-lg mx-auto p-8 sm:p-12">
              <CardContent>
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-12 w-12 text-red-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Sua lista está vazia
                </h2>
                <p className="text-gray-600 mb-8">
                  Clique no coração dos produtos que você gosta para os guardar
                  aqui e não os perder de vista!
                </p>
                <Button asChild size="lg">
                  <Link href="/#produtos">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Explorar Produtos
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {favoriteProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={isFavorite(product.id)}
                  onToggleFavorite={() => {
                    if (isFavorite(product.id)) {
                      removeFavorite(product.id);
                    } else {
                      addFavorite(product.id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

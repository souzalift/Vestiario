'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/services/products';
import { useSearchParams } from 'next/navigation';

const LEAGUES = [
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Brasileirão',
  'Ligue 1',
];

const PER_PAGE = 25;

// O componente não precisa mais da prop 'league'.
interface ProductGridProps {
  searchQuery: string;
  selectedLeague: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ searchQuery }) => {
  const searchParams = useSearchParams();
  const category =
    searchParams.get('team') || searchParams.get('league') || 'Todos';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Usar useCallback para memorizar a função de busca
  const fetchProducts = useCallback(
    async (currentPage: number, isNewFilter: boolean) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('perPage', PER_PAGE.toString());

        if (searchQuery) {
          params.set('search', searchQuery);
        } else if (category && category !== 'Todos') {
          const isLeague = LEAGUES.includes(category);
          params.set(isLeague ? 'league' : 'team', category);
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
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
            team: item.team || '',
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          }));

          // Se for um filtro novo, substitui os produtos. Caso contrário, anexa.
          setProducts((prev) =>
            isNewFilter ? mappedProducts : [...prev, ...mappedProducts],
          );
          setHasMore(
            data.pagination?.hasMore ?? mappedProducts.length === PER_PAGE,
          );
        } else {
          if (isNewFilter) setProducts([]); // Limpa os produtos em um novo filtro sem resultados
          setHasMore(false);
        }
      } catch (error) {
        console.error('Falha ao buscar produtos:', error);
        if (isNewFilter) setProducts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [category, searchQuery],
  ); // Dependências para o callback

  // useEffect único e unificado para lidar com busca de dados e reset de estado.
  useEffect(() => {
    // Quando category ou searchQuery muda, reinicia tudo e busca a página 1.
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(1, true); // `true` indica que é um novo filtro
  }, [category, searchQuery, fetchProducts]);

  const handleLoadMore = () => {
    // Apenas incrementa a página. O useEffect cuidará da busca.
    if (!loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Efeito para buscar páginas subsequentes
  useEffect(() => {
    // Não busca na carga inicial (página 1), pois o efeito acima já cuidou disso.
    if (page > 1) {
      fetchProducts(page, false); // `false` indica que estamos anexando produtos
    }
  }, [page, fetchProducts]);

  // Estado de esqueleto de layout: apenas no carregamento inicial.
  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
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

  // Estado vazio: quando não há produtos e não está carregando.
  if (!loading && products.length === 0) {
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

  // Estado de sucesso: renderiza a grade e o botão "Carregar Mais".
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {products.map((product) => (
          <ProductCard
            key={`${product.id}-${product.slug}`}
            product={product}
            onAddToCart={(product) =>
              console.log('Adicionar ao carrinho:', product.title)
            }
            onToggleFavorite={(product) =>
              console.log('Toggle favorito:', product.title)
            }
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            {loading ? 'Carregando...' : 'Carregar Mais'}
          </button>
        </div>
      )}
    </>
  );
};

export default ProductGrid;

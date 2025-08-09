// app/produtos/page.tsx
'use client';

import { useProducts } from '@/hooks/useProducts';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import { Grid, List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductFilters as IProductFilters } from '@/services/products';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const initialFilters: IProductFilters = {
    category: searchParams.get('categoria') || undefined,
    search: searchParams.get('busca') || undefined,
    sortBy: 'newest',
  };

  const {
    products,
    loading,
    error,
    hasMore,
    filters,
    updateFilters,
    loadMore,
    refresh,
  } = useProducts(initialFilters);

  useEffect(() => {
    // Atualizar filtros baseado nos parâmetros da URL
    const newFilters: IProductFilters = {
      category: searchParams.get('categoria') || undefined,
      search: searchParams.get('busca') || undefined,
      sortBy: (searchParams.get('ordem') as any) || 'newest',
    };
    updateFilters(newFilters);
  }, [searchParams, updateFilters]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Erro ao carregar produtos
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refresh}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <ProductFilters filters={filters} onFiltersChange={updateFilters} />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {filters.category && filters.category !== 'Todos'
                    ? filters.category
                    : 'Todos os Produtos'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {loading
                    ? 'Carregando...'
                    : `${products.length} produtos encontrados`}
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
              <>
                <div
                  className={`grid gap-6 ${
                    viewMode === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                      : 'grid-cols-1'
                  }`}
                >
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      className={viewMode === 'list' ? 'flex-row' : ''}
                    />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center mt-12">
                    <Button
                      onClick={loadMore}
                      disabled={loading}
                      size="lg"
                      variant="outline"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        'Carregar mais produtos'
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              !loading && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Nenhum produto encontrado
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Tente ajustar os filtros ou buscar por outros termos
                  </p>
                  <Button onClick={() => updateFilters({ sortBy: 'newest' })}>
                    Ver todos os produtos
                  </Button>
                </div>
              )
            )}

            {/* Loading State */}
            {loading && products.length === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                  >
                    <div className="aspect-square bg-gray-200 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                      <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

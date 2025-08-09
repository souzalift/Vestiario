// hooks/useProducts.ts
import { useState, useEffect, useCallback } from 'react';
import {
  getProducts,
  Product,
  ProductFilters,
  QueryDocumentSnapshot
} from '@/services/products';

export const useProducts = (initialFilters: ProductFilters = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | undefined>();
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);

  const fetchProducts = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const result = await getProducts(
        filters,
        20,
        reset ? undefined : lastDoc
      );

      if (reset) {
        setProducts(result.products);
      } else {
        setProducts(prev => [...prev, ...result.products]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, [filters, lastDoc]);

  const updateFilters = useCallback((newFilters: ProductFilters) => {
    setFilters(newFilters);
    setLastDoc(undefined);
    setProducts([]);
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchProducts(false);
    }
  }, [hasMore, loading, fetchProducts]);

  const refresh = useCallback(() => {
    setLastDoc(undefined);
    setProducts([]);
    fetchProducts(true);
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts(true);
  }, [filters]);

  return {
    products,
    loading,
    error,
    hasMore,
    filters,
    updateFilters,
    loadMore,
    refresh,
  };
};
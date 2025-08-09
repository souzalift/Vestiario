// hooks/useProduct.ts
import { useState, useEffect } from 'react';
import { getProduct, getProductBySlug, Product } from '@/services/products';

export const useProduct = (identifier: string, bySlug = false) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const productData = bySlug
          ? await getProductBySlug(identifier)
          : await getProduct(identifier);

        setProduct(productData);

        if (!productData) {
          setError('Produto não encontrado');
        }
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
        setError('Erro ao carregar produto');
      } finally {
        setLoading(false);
      }
    };

    if (identifier) {
      fetchProduct();
    }
  }, [identifier, bySlug]);

  return { product, loading, error };
};
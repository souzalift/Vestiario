'use client';

import { useEffect, useRef } from 'react';

interface UseViewTrackerOptions {
  productSlug: string;
  enabled?: boolean;
  delay?: number; // Delay em ms antes de registrar a view
}

export function useViewTracker({
  productSlug,
  enabled = true,
  delay = 2000 // 2 segundos
}: UseViewTrackerOptions) {
  const hasTracked = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled || !productSlug || hasTracked.current) {
      return;
    }

    // Limpar timeout anterior se houver
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Registrar view após delay
    timeoutRef.current = setTimeout(async () => {
      try {
        console.log(`👁️ Registrando view para produto: ${productSlug}`);

        const response = await fetch(`/api/products/${productSlug}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          hasTracked.current = true;
          console.log(`✅ View registrada para produto: ${productSlug}`, result);
        } else {
          const error = await response.text();
          console.error('❌ Erro ao registrar view:', error);
        }
      } catch (error) {
        console.error('❌ Erro ao registrar view:', error);
      }
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [productSlug, enabled, delay]);

  // Função para forçar registro de view
  const trackView = async () => {
    if (!productSlug) return false;

    try {
      const response = await fetch(`/api/products/${productSlug}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        hasTracked.current = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao forçar view:', error);
      return false;
    }
  };

  // Função para buscar views atuais
  const getViews = async () => {
    if (!productSlug) return null;

    try {
      const response = await fetch(`/api/products/${productSlug}/view`);

      if (response.ok) {
        const result = await response.json();
        return result.success ? result.views : null;
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar views:', error);
      return null;
    }
  };

  return { trackView, getViews };
}
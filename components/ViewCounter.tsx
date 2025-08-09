'use client';

import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';

interface ViewCounterProps {
  productSlug: string;
  initialViews?: number;
  showIcon?: boolean;
  className?: string;
}

export function ViewCounter({
  productSlug,
  initialViews = 0,
  showIcon = true,
  className = '',
}: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);
  const [loading, setLoading] = useState(false);

  // Buscar views atuais
  const fetchViews = async () => {
    if (!productSlug) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productSlug}/view`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setViews(data.views);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar views:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViews();
  }, [productSlug]);

  return (
    <span
      className={`flex items-center gap-1 text-sm text-gray-500 ${className}`}
    >
      {showIcon && <Eye className="w-4 h-4" />}
      <span>
        {loading ? '...' : views.toLocaleString('pt-BR')}
        {views === 1 ? ' visualização' : ' visualizações'}
      </span>
    </span>
  );
}

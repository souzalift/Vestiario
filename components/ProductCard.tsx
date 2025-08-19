// components/ProductCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/services/products';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  isFavorite?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  className = '',
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageError = () => {
    setImageError(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Verificar se o produto tem dados mínimos necessários
  if (!product || !product.title) {
    return null;
  }

  return (
    <div
      className={`group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      <div className="relative">
        {/* Product Image */}
        <Link href={`/produto/${product.slug || product.id}`}>
          <div className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer">
            {!imageError &&
            product.images &&
            product.images.length > 0 &&
            product.images[currentImageIndex] ? (
              <Image
                src={product.images[currentImageIndex]}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-2">⚽</div>
                  <p className="text-sm">Sem imagem</p>
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.featured && (
                <Badge variant="secondary" className="bg-yellow-500 text-white">
                  Destaque
                </Badge>
              )}
            </div>

            {/* Favorite Button */}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleFavorite(product);
                }}
                className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`}
                />
              </button>
            )}

            {/* Image Navigation */}
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>

        {/* Quick Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors">
          <div className="absolute bottom-4 left-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0">
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.preventDefault();
                // Adicionar visualização rápida
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver
            </Button>
            {onAddToCart && (
              <Button
                size="sm"
                className="flex-1 text-white bg-stone-700  "
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(product);
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Carrinho
              </Button>
            )}
          </div>
        </div>
      </div>
      {/* Product Info */}

      <div className="p-4 flex flex-col h-44">
        {' '}
        {/* <-- altura fixa para alinhar conteúdo */}
        <Link
          href={`/produto/${product.slug}`}
          className="flex-1 flex flex-col"
        >
          {/* Title - Tamanho de fonte menor em mobile (text-xs) e maior em desktop (sm:text-sm) */}
          <h3 className="text-xs sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.title}
          </h3>

          {/* Player Info (sem alteração) */}
          {(product.playerName || product.playerNumber) && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              {product.playerName && <span>{product.playerName}</span>}
              {product.playerNumber && (
                <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                  #{product.playerNumber}
                </span>
              )}
            </div>
          )}

          {/* Espaço flexível para empurrar o rodapé */}
          <div className="flex-1" />

          {/* Rodapé fixo: preço, badge e tamanhos */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price || 0)}
                </span>
              </div>
              <div className="text-xs">
                {/* Badge - Escondido em mobile (hidden) e visível em desktop (sm:block) */}
                <span className="hidden sm:block text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                  Disponível
                </span>
              </div>
            </div>
            {product.sizes && product.sizes.length > 0 && (
              // Tamanhos - Ficam em uma única linha com scroll horizontal em mobile
              <div className="flex gap-1 mt-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {product.sizes.slice(0, 6).map((size) => (
                  <span
                    key={size}
                    className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600"
                  >
                    {size}
                  </span>
                ))}
                {product.sizes.length > 6 && (
                  <span className="text-xs px-2 py-1 text-gray-400">
                    +{product.sizes.length - 6}
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}

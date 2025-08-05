import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  league?: string;
  team?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-500 transform hover:-translate-y-2">
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {product.league && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
            {product.league}
          </div>
        )}
      </div>

      <Link href={`/produto/${product._id}`} className="block">
        {/* Image Container */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Quick Action Button */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <button className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-semibold shadow-xl hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
              <ShoppingCart className="w-4 h-4" />
              Comprar Agora
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Team */}
          {product.team && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                {product.team}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-bold text-xl mb-3 text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-green-600">
                {formatPrice(product.price)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">
                ou 3x de {formatPrice(product.price / 3)} sem juros
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-6 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]">
            Ver Detalhes
          </button>
        </div>
      </Link>
    </div>
  );
}

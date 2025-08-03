import Image from 'next/image';
import Link from 'next/link';

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
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <Link href={`/produto/${product._id}`}>
        {/* Container com aspecto 3:4 fixo */}
        <div className="relative w-full aspect-[3/4] overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          {product.league && (
            <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              {product.league}
            </div>
          )}
          
          {/* Overlay sutil no hover */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors duration-300" />
        </div>
        
        <div className="p-5">
          <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2 leading-tight">
            {product.title}
          </h3>
          
          {product.team && (
            <p className="text-sm text-blue-600 font-medium mb-2">
              {product.team}
            </p>
          )}
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-green-600">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-gray-500">
                ou 12x de {formatPrice(product.price / 12)}
              </span>
            </div>
            
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow-md hover:shadow-lg">
              Ver Detalhes
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
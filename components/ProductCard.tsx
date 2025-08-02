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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/produto/${product._id}`}>
        <div className="relative h-64">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          {product.league && (
            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
              {product.league}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-gray-800 line-clamp-2">
            {product.title}
          </h3>
          
          {product.team && (
            <p className="text-sm text-gray-600 mb-2">
              {product.team}
            </p>
          )}
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600">
              {formatPrice(product.price)}
            </span>
            
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
              Ver Detalhes
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
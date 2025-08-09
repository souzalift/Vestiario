'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface Category {
  name: string;
  image: string;
  count: string;
  accentColor: string;
  icon: string;
}

const categories: Category[] = [
  {
    name: 'Brasileirão',
    image: '/images/brasileirao.png',
    count: '20 Times',
    accentColor: 'text-green-600',
    icon: '🇧🇷',
  },
  {
    name: 'Premier League',
    image: '/images/premier.png',
    count: '18 Times',
    accentColor: 'text-purple-600',
    icon: '🏴',
  },
  {
    name: 'La Liga',
    image: '/images/laliga.png',
    count: '16 Times',
    accentColor: 'text-red-600',
    icon: '🇪🇸',
  },
  {
    name: 'Champions League',
    image: '/images/champions.png',
    count: '32 Times',
    accentColor: 'text-blue-600',
    icon: '🏆',
  },
];

interface CategoryCardProps {
  category: Category;
  index: number;
}

function CategoryCard({ category, index }: CategoryCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // Mapear cores de borda
  const getBorderColor = (accentColor: string) => {
    const borderMap: { [key: string]: string } = {
      'text-green-600': 'hover:border-green-400',
      'text-purple-600': 'hover:border-purple-400',
      'text-red-600': 'hover:border-red-400',
      'text-blue-600': 'hover:border-blue-400',
    };
    return borderMap[accentColor] || 'hover:border-gray-400';
  };

  return (
    <Link
      href={`/?categoria=${category.name}`}
      className={`group bg-white rounded-2xl border border-gray-300 ${getBorderColor(
        category.accentColor,
      )}
                 p-6 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1`}
    >
      {/* Imagem centralizada */}
      <div className="flex items-center justify-center h-32 mb-6">
        {!imageError ? (
          <div className="relative w-full h-full max-w-[200px]">
            <Image
              src={category.image}
              alt={`Logo ${category.name}`}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              sizes="100px"
              onError={handleImageError}
            />
          </div>
        ) : (
          /* Fallback minimalista */
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">{category.icon}</span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="text-center">
        <h3
          className={`${category.accentColor} font-bold text-lg mb-2 
                       group-hover:scale-105 transition-transform duration-300`}
        >
          {category.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4">{category.count}</p>

        {/* CTA */}
        <div
          className={`inline-flex items-center ${category.accentColor} text-sm font-medium 
                        group-hover:translate-x-1 transition-transform duration-300`}
        >
          <span>Explorar</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedCategories() {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary-900 mb-4">
            Principais Competições
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Camisas tailandesas dos maiores campeonatos do mundo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.name}
              category={category}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

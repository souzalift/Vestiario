'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const categories = [
  { name: 'Todos', icon: '🌍' },
  { name: 'Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'La Liga', icon: '🇪🇸' },
  { name: 'Serie A', icon: '🇮🇹' },
  { name: 'Bundesliga', icon: '🇩🇪' },
  { name: 'Brasileirão', icon: '🇧🇷' }
];

interface CategoryFilterProps {
  selectedCategory: string;
}

export default function CategoryFilter({ selectedCategory }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (category === 'Todos') {
      params.delete('categoria');
    } else {
      params.set('categoria', category);
    }
    
    router.push(`/?${params.toString()}#produtos`);
  };

  return (
    <div id="produtos" className="mb-12">
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => handleCategoryChange(category.name)}
            className={`group flex items-center gap-3 px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
              selectedCategory === category.name
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200'
            }`}
          >
            <span className="text-lg group-hover:scale-110 transition-transform">
              {category.icon}
            </span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';

const categories = [
  { 
    name: 'Todos', 
    icon: '🌍' // Mantém emoji para "Todos"
  },
  { 
    name: 'Premier League', 
    logo: 'https://zdlvtzr07o.ufs.sh/f/cXvxCn0ZpQhH5N6cRpmfj75w32KxhWAJvyloDuYcdn0bMs9i',
    teams: ['Manchester United', 'Arsenal', 'Chelsea', 'Liverpool', 'Manchester City', 'Tottenham']
  },
  { 
    name: 'La Liga', 
    logo: 'https://zdlvtzr07o.ufs.sh/f/cXvxCn0ZpQhHeVR5Rh7GF6SbcRANd8MEDiPokpvOHywKmlfQ',
    teams: ['Real Madrid', 'Barcelona', 'Atlético Madrid', 'Sevilla', 'Valencia', 'Real Sociedad']
  },
  { 
    name: 'Serie A', 
    logo: 'https://zdlvtzr07o.ufs.sh/f/cXvxCn0ZpQhHPeSG73yF7ZgQzTo3HiqDLN0jbB9We8VcrUxY',
    teams: ['Juventus', 'Milan', 'Inter de Milão', 'Napoli', 'Roma', 'Lazio']
  },
  { 
    name: 'Bundesliga', 
    logo: 'https://zdlvtzr07o.ufs.sh/f/cXvxCn0ZpQhHNsLdDYkHsjPrt3ZUcJ56kXSI27xVRTQLyWwm',
    teams: ['Bayern de Munique', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen', 'Eintracht Frankfurt', 'Borussia Mönchengladbach']
  },
  { 
    name: 'Brasileirão', 
    logo: 'https://zdlvtzr07o.ufs.sh/f/cXvxCn0ZpQhH0Ld8JOIFNOAv4wCjohudz8QrMJtcHIX62Epi',
    teams: ['Bahia', 'Flamengo', 'Palmeiras', 'Corinthians', 'São Paulo', 'Santos', 'Vasco', 'Botafogo', 'Fluminense', 'Grêmio', 'Internacional']
  }
];

interface CategoryFilterProps {
  selectedCategory: string;
}

export default function CategoryFilter({ selectedCategory }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (category === 'Todos') {
      params.delete('categoria'); // Mudança aqui
    } else {
      params.set('categoria', category); // Mudança aqui
    }
    
    router.push(`/?${params.toString()}#produtos`);
    setOpenDropdown(null);
  };

  const handleTeamChange = (team: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('categoria', team); // Mudança aqui
    router.push(`/?${params.toString()}#produtos`);
    setOpenDropdown(null);
  };

  const toggleDropdown = (categoryName: string) => {
    setOpenDropdown(openDropdown === categoryName ? null : categoryName);
  };

  const handleMouseEnter = (categoryName: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (categories.find(cat => cat.name === categoryName)?.teams) {
      setOpenDropdown(categoryName);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 500);
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleDropdownMouseLeave = () => {
    handleMouseLeave();
  };

  return (
    <div id="produtos" className="mb-12">
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((category) => (
          <div 
            key={category.name} 
            className="relative"
            onMouseEnter={() => handleMouseEnter(category.name)}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => {
                if (category.teams) {
                  toggleDropdown(category.name);
                } else {
                  handleCategoryChange(category.name);
                }
              }}
              className={`group flex items-center gap-3 px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category.name
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200'
              }`}
            >
              {/* Logo ou Ícone */}
              {category.logo ? (
                <div className="relative w-6 h-6 group-hover:scale-110 transition-transform">
                  <Image
                    src={category.logo}
                    alt={`${category.name} logo`}
                    fill
                    className="object-contain"
                    sizes="24px"
                  />
                </div>
              ) : (
                <span className="text-lg group-hover:scale-110 transition-transform">
                  {category.icon}
                </span>
              )}
              
              <span>{category.name}</span>
              {category.teams && (
                <ChevronDown 
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openDropdown === category.name ? 'rotate-180' : ''
                  }`} 
                />
              )}
            </button>

            {/* Dropdown Menu */}
            {category.teams && openDropdown === category.name && (
              <div 
                className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-48 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
              >
                {/* Liga completa */}
                <button
                  onClick={() => handleCategoryChange(category.name)}
                  className={`w-full text-left px-4 py-2 text-sm font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 ${
                    selectedCategory === category.name ? 'text-blue-600 bg-blue-50' : 'text-gray-900'
                  }`}
                >
                  {category.logo && (
                    <div className="relative w-4 h-4">
                      <Image
                        src={category.logo}
                        alt={`${category.name} logo`}
                        fill
                        className="object-contain"
                        sizes="16px"
                      />
                    </div>
                  )}
                  {category.name}
                </button>
                
                <hr className="my-2 border-gray-100" />
                
                {/* Times individuais */}
                {category.teams.map((team) => (
                  <button
                    key={team}
                    onClick={() => handleTeamChange(team)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      selectedCategory === team ? 'text-secondary bg-red-50 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {team}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
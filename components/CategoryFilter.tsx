'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';

const categories = [
  {
    name: 'Todos',
    icon: '🌍', // Mantém emoji para "Todos"
  },
  {
    name: 'Brasileirão',
    logo: 'https://firebasestorage.googleapis.com/v0/b/o-vestiario-67951.firebasestorage.app/o/logo-ligas%2Fbrasileirao.png?alt=media&token=dcd6c766-facb-474b-922c-8fe7253b5120',
    teams: [
      'Atlético Mineiro',
      'Bahia',
      'Botafogo',
      'Ceará',
      'Corinthians',
      'Cruzeiro',
      'Flamengo',
      'Fluminense',
      'Fortaleza',
      'Grêmio',
      'Internacional',
      'Juventude',
      'Mirassol',
      'Palmeiras',
      'Red Bull Bragantino',
      'Santos',
      'São Paulo',
      'Sport Recife',
      'Vasco da Gama',
      'Vitória',
    ],
  },
  {
    name: 'Premier League',
    logo: 'https://firebasestorage.googleapis.com/v0/b/o-vestiario-67951.firebasestorage.app/o/logo-ligas%2Fpremierleague.png?alt=media&token=be4395fd-9ed4-47e7-be1e-194c1d4b7ff6',
    teams: [
      'Arsenal',
      'Aston Villa',
      'Bournemouth',
      'Brentford',
      'Brighton',
      'Chelsea',
      'Crystal Palace',
      'Everton',
      'Fulham',
      'Ipswich Town',
      'Leicester City',
      'Liverpool',
      'Manchester City',
      'Manchester United',
      'Newcastle United',
      'Nottingham Forest',
      'Southampton',
      'Tottenham Hotspur',
      'West Ham United',
      'Wolverhampton',
    ],
  },
  {
    name: 'La Liga',
    logo: 'https://firebasestorage.googleapis.com/v0/b/o-vestiario-67951.firebasestorage.app/o/logo-ligas%2Flaliga.png?alt=media&token=a18399af-05bb-4c47-ba51-5a9be56ba4f2',
    teams: [
      'Alavés',
      'Almería',
      'Athletic Bilbao',
      'Atlético Madrid',
      'Barcelona',
      'Celta de Vigo',
      'Espanyol',
      'Getafe',
      'Girona',
      'Las Palmas',
      'Leganés',
      'Mallorca',
      'Osasuna',
      'Rayo Vallecano',
      'Real Betis',
      'Real Madrid',
      'Real Sociedad',
      'Sevilla',
      'Valencia',
      'Valladolid',
    ],
  },
  {
    name: 'Serie A',
    logo: 'https://zdlvtzr07o.ufs.sh/f/cXvxCn0ZpQhHPeSG73yF7ZgQzTo3HiqDLN0jbB9We8VcrUxY',
    teams: [
      'Atalanta',
      'Bologna',
      'Cagliari',
      'Como',
      'Empoli',
      'Fiorentina',
      'Genoa',
      'Hellas Verona',
      'Inter de Milão',
      'Juventus',
      'Lazio',
      'Lecce',
      'Milan',
      'Monza',
      'Napoli',
      'Parma',
      'Roma',
      'Torino',
      'Udinese',
      'Venezia',
    ],
  },
  {
    name: 'Bundesliga',
    logo: 'https://firebasestorage.googleapis.com/v0/b/o-vestiario-67951.firebasestorage.app/o/logo-ligas%2Fbundesliga.png?alt=media&token=3ab8afb5-c7f6-456a-9bb8-00bb20dd083d',
    teams: [
      'Augsburg',
      'Bayer Leverkusen',
      'Bayern de Munique',
      'Bochum',
      'Borussia Dortmund',
      'Borussia Mönchengladbach',
      'Eintracht Frankfurt',
      'Friburgo',
      'Heidenheim',
      'Hoffenheim',
      'Mainz 05',
      'RB Leipzig',
      'St. Pauli',
      'Stuttgart',
      'Union Berlin',
      'Werder Bremen',
      'Wolfsburg',
    ],
  },
  {
    name: 'Ligue 1',
    logo: 'https://firebasestorage.googleapis.com/v0/b/o-vestiario-67951.firebasestorage.app/o/logo-ligas%2Fleague1.png?alt=media&token=f9830919-5f4e-4710-ac2a-6967bd969fa4', // adicionar URL do logo se desejar
    teams: [
      'Angers',
      'Auxerre',
      'Brest',
      'Le Havre',
      'Lens',
      'Lille',
      'Lyon',
      'Marseille',
      'Monaco',
      'Montpellier',
      'Nantes',
      'Nice',
      'Paris Saint-Germain',
      'Reims',
      'Rennes',
      'Saint-Étienne',
      'Strasbourg',
      'Toulouse',
    ],
  },
];

interface CategoryFilterProps {
  selectedCategory: string;
}

export default function CategoryFilter({
  selectedCategory,
}: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLeagueChange = (league: string) => {
    const params = new URLSearchParams(searchParams);

    if (league === 'Todos') {
      params.delete('league');
      params.delete('team'); // remove também time
    } else {
      params.set('league', league);
      params.delete('team'); // só liga, remove time
    }

    router.push(`/?${params.toString()}#produtos`);
    setOpenDropdown(null);
  };

  const handleTeamChange = (team: string) => {
    const params = new URLSearchParams(searchParams);

    if (team === 'Todos') {
      params.delete('team');
      params.delete('league'); // remove também liga
    } else {
      params.set('team', team);
      params.delete('league'); // só time, remove liga
    }

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

    if (categories.find((cat) => cat.name === categoryName)?.teams) {
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
                  handleLeagueChange(category.name);
                }
              }}
              className={`group flex items-center gap-3 px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category.name
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
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
                  onClick={() => handleLeagueChange(category.name)}
                  className={`w-full text-left px-4 py-2 text-sm font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 ${
                    selectedCategory === category.name
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-900'
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
                      selectedCategory === team
                        ? 'text-blue-600 bg-blue-50 font-medium'
                        : 'text-gray-700'
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

// components/ProductFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import { ProductFilters as IProductFilters } from '@/services/products';
import { getCategories } from '@/services/products';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ProductFiltersProps {
  filters: IProductFilters;
  onFiltersChange: (filters: IProductFilters) => void;
  className?: string;
}

const SIZES = ['P', 'M', 'G', 'GG', 'XGG'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais Recentes' },
  { value: 'popular', label: 'Mais Populares' },
  { value: 'price_asc', label: 'Menor Preço' },
  { value: 'price_desc', label: 'Maior Preço' },
  { value: 'rating', label: 'Melhor Avaliados' },
];

export default function ProductFilters({
  filters,
  onFiltersChange,
  className = '',
}: ProductFiltersProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<IProductFilters>(filters);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(['Todos', ...cats]);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    fetchCategories();
  }, []);

  const updateFilter = (key: keyof IProductFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleSize = (size: string) => {
    const currentSizes = localFilters.sizes || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter((s) => s !== size)
      : [...currentSizes, size];

    updateFilter('sizes', newSizes.length > 0 ? newSizes : undefined);
  };

  const clearFilters = () => {
    const clearedFilters: IProductFilters = {
      sortBy: 'newest',
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category && filters.category !== 'Todos') count++;
    if (filters.search) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.sizes && filters.sizes.length > 0) count++;
    if (filters.featured) count++;
    return count;
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtros</h3>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Limpar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </Button>
        </div>
      </div>

      <div className={`space-y-6 ${isOpen ? 'block' : 'hidden md:block'}`}>
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Nome do time, jogador..."
              value={localFilters.search || ''}
              onChange={(e) =>
                updateFilter('search', e.target.value || undefined)
              }
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Categorias
          </label>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={
                    localFilters.category === category ||
                    (!localFilters.category && category === 'Todos')
                  }
                  onChange={(e) =>
                    updateFilter(
                      'category',
                      e.target.value === 'Todos' ? undefined : e.target.value,
                    )
                  }
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Faixa de Preço
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="number"
                placeholder="Mín"
                value={localFilters.minPrice || ''}
                onChange={(e) =>
                  updateFilter(
                    'minPrice',
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="text-sm"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Máx"
                value={localFilters.maxPrice || ''}
                onChange={(e) =>
                  updateFilter(
                    'maxPrice',
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tamanhos
          </label>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                  localFilters.sizes?.includes(size)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-700 hover:border-primary-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Ordenar por
          </label>
          <select
            value={localFilters.sortBy || 'newest'}
            onChange={(e) => updateFilter('sortBy', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Filtros Rápidos
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localFilters.featured || false}
                onChange={(e) =>
                  updateFilter('featured', e.target.checked || undefined)
                }
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Produtos em destaque
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

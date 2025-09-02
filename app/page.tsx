import { Suspense } from 'react';

// Componentes
import ProductGrid from '@/components/ProductGrid';
import LeagueFilter from '@/components/LeagueFilter';
import HeroBannerGallery from '@/components/HeroBannerGallery';
import WhyChooseUs from '@/components/WhyChooseUs'; // Novo componente
import ContactCTA from '@/components/ContactCTA'; // Novo componente
import { Loader2 } from 'lucide-react';

// Dados
import { siteBanners } from '@/lib/banners'; // Novos dados do banner

// Tipos
interface Props {
  searchParams?: {
    league?: string;
    q?: string;
  };
}

export default function Home({ searchParams }: Props) {
  const selectedLeague = searchParams?.league || 'Todos';
  const searchQuery = searchParams?.q || '';

  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Banner agora recebe os dados via props */}
      <HeroBannerGallery banners={siteBanners} />

      {/* 2. Nova secção consolidada de "Por que nos escolher" */}
      <WhyChooseUs />

      {/* 3. Secção Principal de Produtos */}
      <div id="produtos" className="bg-gray-50 py-20 flex-1">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-heading text-neutral-900 mb-4 uppercase tracking-wider">
              {searchQuery
                ? `Resultados para "${searchQuery}"`
                : 'Nossas Coleções'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {searchQuery
                ? `Encontre as melhores camisas tailandesas para a sua busca`
                : 'Explore as últimas temporadas das principais ligas do mundo.'}
            </p>
          </div>

          {/* Filtro de Ligas (escondido quando há uma busca) */}
          {!searchQuery && (
            <div className="mb-12">
              <LeagueFilter />
            </div>
          )}

          {/* Grelha de Produtos */}
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid
              searchQuery={searchQuery}
              selectedLeague={selectedLeague}
            />
          </Suspense>
        </div>
      </div>

      {/* 4. Nova secção de contato via WhatsApp */}
      <ContactCTA />
    </div>
  );
}

// Componente de Skeleton para o carregamento dos produtos
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm animate-pulse">
          <div className="bg-gray-200 aspect-square rounded-t-2xl"></div>
          <div className="p-6 space-y-4">
            <div className="bg-gray-200 h-5 rounded w-3/4"></div>
            <div className="bg-gray-200 h-4 rounded w-1/2"></div>
            <div className="bg-gray-200 h-8 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

import { Suspense } from 'react';
import ProductGrid from '@/components/ProductGrid';
import CategoryFilter from '@/components/CategoryFilter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';


interface Props {
  searchParams: Promise<{ categoria?: string; busca?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const selectedCategory = typeof params.categoria === 'string' ? params.categoria : 'Todos';
  const searchQuery = typeof params.busca === 'string' ? params.busca : '';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Hero Section - Compact */}
      <div className="bg-gradient-to-r from-primary to-primary-dark py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            O Vestiário
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Camisas oficiais dos maiores clubes do mundo com qualidade autêntica
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-gray-50 py-16 flex-1">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {searchQuery ? `Resultados para "${searchQuery}"` : 'Camisas Oficiais'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {searchQuery 
                ? `Encontre as melhores camisas para sua busca`
                : 'Descubra nossa coleção completa de camisas oficiais dos maiores clubes do mundo'
              }
            </p>
          </div>
          
          {/* Category Filter - Hide when searching */}
          {!searchQuery && (
            <div className="mb-12">
              <CategoryFilter selectedCategory={selectedCategory} />
            </div>
          )}
          
          {/* Products Grid */}
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid category={selectedCategory} searchQuery={searchQuery} />
          </Suspense>
        </div>
      </div>
      
      {/* Newsletter Section */}
      <NewsletterSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

// Loading skeleton component
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
          <div className="space-y-3">
            <div className="bg-gray-200 h-4 rounded w-3/4"></div>
            <div className="bg-gray-200 h-4 rounded w-1/2"></div>
            <div className="bg-gray-200 h-6 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Newsletter section component
function NewsletterSection() {
  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark py-16">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-3xl font-bold text-white mb-4">
          Fique por dentro das novidades
        </h3>
        <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Receba em primeira mão os lançamentos e ofertas exclusivas
        </p>
        <div className="max-w-md mx-auto flex gap-4">
          <input
            type="email"
            placeholder="Seu e-mail"
            className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:outline-none"
          />
          <button className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Inscrever
          </button>
        </div>
      </div>
    </div>
  );
}
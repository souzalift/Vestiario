import { Suspense } from 'react';
import ProductGrid from '@/components/ProductGrid';
import CategoryFilter from '@/components/CategoryFilter';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import {
  Shield,
  Truck,
  Star,
  Users,
  Trophy,
  Globe,
  ArrowRight,
  Check,
  Heart,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Props {
  searchParams: Promise<{ categoria?: string; busca?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const selectedCategory =
    typeof params.categoria === 'string' ? params.categoria : 'Todos';
  const searchQuery = typeof params.busca === 'string' ? params.busca : '';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Trust Indicators */}
      <TrustSection />

      {/* Featured Categories */}
      <FeaturedCategories />

      {/* Main Content */}
      <div className="bg-gray-50 py-16 flex-1">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Trophy className="w-4 h-4" />
              Produtos Oficiais
            </div>
            <h2 className="text-4xl font-bold text-primary-900 mb-4">
              {searchQuery
                ? `Resultados para "${searchQuery}"`
                : 'Camisas Oficiais Premium'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {searchQuery
                ? `Encontre as melhores camisas para sua busca`
                : 'Descubra nossa coleção exclusiva de camisas oficiais dos maiores clubes do mundo'}
            </p>
          </div>

          {/* Category Filter - Hide when searching */}
          {!searchQuery && (
            <div className="mb-12">
              <CategoryFilter selectedCategory="Todos" />
            </div>
          )}

          {/* Products Grid */}
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid
              category={selectedCategory}
              searchQuery={searchQuery}
            />
          </Suspense>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <WhyChooseUsSection />

      {/* Popular Teams */}
      <PopularTeamsSection />

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Trust Section
function TrustSection() {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Produto Autêntico',
      description: '100% Original',
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: 'Frete Grátis',
      description: 'Todo o Brasil',
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Qualidade Premium',
      description: 'Garantia Total',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: '10k+ Clientes',
      description: 'Satisfeitos',
    },
  ];

  return (
    <div className="bg-white py-16 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-800 rounded-2xl mb-4 group-hover:bg-primary-800 group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="font-bold text-primary-900 mb-1">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Featured Categories
function FeaturedCategories() {
  const categories = [
    {
      name: 'Brasileirão',
      image: '/images/brasileirao.jpg',
      count: '20 Times',
      color: 'from-green-600 to-yellow-500',
    },
    {
      name: 'Premier League',
      image: '/images/premier.jpg',
      count: '18 Times',
      color: 'from-purple-600 to-blue-600',
    },
    {
      name: 'La Liga',
      image: '/images/laliga.jpg',
      count: '16 Times',
      color: 'from-red-600 to-orange-500',
    },
    {
      name: 'Champions League',
      image: '/images/champions.jpg',
      count: '32 Times',
      color: 'from-blue-800 to-blue-600',
    },
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary-900 mb-4">
            Principais Competições
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Encontre camisas dos maiores campeonatos do mundo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={`/?categoria=${category.name}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/5] hover:scale-105 transition-all duration-500"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

              <div className="relative z-10 p-6 h-full flex flex-col justify-end">
                <h3 className="text-white font-bold text-xl mb-2">
                  {category.name}
                </h3>
                <p className="text-white/90 text-sm mb-4">{category.count}</p>
                <div className="flex items-center text-white group-hover:translate-x-1 transition-transform">
                  <span className="text-sm font-medium">Explorar</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Why Choose Us Section
function WhyChooseUsSection() {
  const benefits = [
    {
      icon: <Check className="w-8 h-8" />,
      title: 'Autenticidade Garantida',
      description:
        'Todas as nossas camisas são 100% originais e licenciadas oficialmente pelos clubes.',
      color: 'bg-green-100 text-green-800',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Paixão pelo Futebol',
      description:
        'Somos fanáticos por futebol e entendemos a importância de cada camisa para o torcedor.',
      color: 'bg-secondary-100 text-secondary-800',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Sempre Atualizado',
      description:
        'Lançamentos exclusivos e as últimas camisas dos seus times favoritos em primeira mão.',
      color: 'bg-accent-100 text-accent-800',
    },
  ];

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary-900 mb-4">
            Por que escolher O Vestiário?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mais que uma loja, somos uma comunidade apaixonada por futebol
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center group">
              <div
                className={`inline-flex items-center justify-center w-20 h-20 ${benefit.color} rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                {benefit.icon}
              </div>
              <h3 className="text-2xl font-bold text-primary-900 mb-4">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Popular Teams Section
function PopularTeamsSection() {
  const teams = [
    { name: 'Flamengo', logo: '/logos/flamengo.png', sales: '2.5k' },
    { name: 'Corinthians', logo: '/logos/corinthians.png', sales: '2.1k' },
    { name: 'Barcelona', logo: '/logos/barcelona.png', sales: '1.8k' },
    { name: 'Real Madrid', logo: '/logos/real.png', sales: '1.7k' },
    { name: 'PSG', logo: '/logos/psg.png', sales: '1.4k' },
    { name: 'Manchester United', logo: '/logos/manu.png', sales: '1.3k' },
  ];

  return (
    <div className="bg-primary-900 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Times Mais Populares
          </h2>
          <p className="text-primary-200 text-xl max-w-2xl mx-auto">
            Os clubes mais amados pelos nossos clientes
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {teams.map((team, index) => (
            <Link
              key={index}
              href={`/?busca=${team.name}`}
              className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-800">
                  {team.name.charAt(0)}
                </span>
              </div>
              <h3 className="text-white font-bold mb-1">{team.name}</h3>
              <p className="text-primary-200 text-sm">{team.sales} vendidas</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Loading skeleton component
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm p-6 animate-pulse"
        >
          <div className="bg-gray-200 h-64 rounded-xl mb-4"></div>
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
    <div className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-800 py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Newsletter Exclusiva
          </div>

          <h3 className="text-4xl font-bold text-white mb-4">
            Não perca nenhum lançamento
          </h3>
          <p className="text-xl text-primary-200 mb-8">
            Seja o primeiro a saber sobre novos produtos, ofertas exclusivas e
            lançamentos especiais
          </p>

          <div className="max-w-md mx-auto">
            <div className="flex gap-3 bg-white/10 backdrop-blur-sm p-2 rounded-2xl">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-3 bg-transparent text-white placeholder-primary-200 border-0 focus:outline-none"
              />
              <button className="bg-accent-500 hover:bg-accent-600 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg hover:shadow-xl">
                Inscrever
              </button>
            </div>
            <p className="text-primary-300 text-sm mt-3">
              Sem spam. Cancele quando quiser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

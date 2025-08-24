import { Suspense } from 'react';
import ProductGrid from '@/components/ProductGrid';
import LeagueFilter from '@/components/LeagueFilter';

import HeroBannerGallery from '@/components/HeroBannerGallery';

import {
  Shield,
  Truck,
  Star,
  Users,
  Trophy,
  Check,
  Heart,
  TrendingUp,
  Award,
  Zap,
  DollarSign,
  Plane,
} from 'lucide-react';

interface Props {
  searchParams: Promise<{
    league: any;
    categoria?: string;
    busca?: string;
  }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const selectedLeague =
    typeof params.league === 'string' ? params.league : 'Todos';
  const searchQuery = typeof params.busca === 'string' ? params.busca : '';

  return (
    <div className="w-full flex flex-col">
      {/* Hero Banner Gallery */}
      <HeroBannerGallery />

      {/* Trust Indicators - Atualizado para camisas tailandesas */}
      <TrustSection />

      {/* Quality Features */}
      <QualityFeaturesSection />

      {/* Main Content */}
      <div id="produtos" className="bg-gray-50 py-16 flex-1">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-neutral-200 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Trophy className="w-4 h-4" />
              Qualidade Tailandesa Premium
            </div>
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              {searchQuery
                ? `Resultados para "${searchQuery}"`
                : 'Camisas de Primeira Linha'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {searchQuery
                ? `Encontre as melhores camisas tailandesas para sua busca`
                : 'A mesma qualidade dos originais com preços justos. Fabricação tailandesa de excelência.'}
            </p>
          </div>

          {/* Category Filter - Hide when searching */}
          {!searchQuery && (
            <div className="mb-12">
              <LeagueFilter />
            </div>
          )}

          {/* Products Grid */}
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid searchQuery={searchQuery} />
          </Suspense>
        </div>
      </div>

      {/* Why Choose Thai Quality */}
      <WhyChooseThaiQualitySection />
    </div>
  );
}

// Trust Section - Atualizado para camisas tailandesas
function TrustSection() {
  const features = [
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Qualidade AAA+',
      description: 'Primeira Linha',
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Preço Justo',
      description: 'Melhor Custo-Benefício',
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: 'Frete Grátis',
      description: 'A partir de 4 camisas',
    },
  ];

  return (
    <div className="bg-white py-16 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-200 text-primary-800 rounded-2xl mb-4 group-hover:bg-neutral-800 group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="font-bold text-neutral-900 mb-1">
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

// Nova seção destacando qualidade tailandesa
function QualityFeaturesSection() {
  return (
    <div className="bg-gradient-to-r from-primary-50 to-blue-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary-900 mb-4">
            Por que Camisas Tailandesas?
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Se refere a réplicas de alta qualidade de uniformes esportivos,
            especialmente de futebol.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Tecnologia Avançada
            </h3>
            <p className="text-gray-600">
              Mesmo tecido e tecnologia Dri-FIT utilizada nas versões oficiais,
              garantindo conforto e durabilidade.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Detalhes Perfeitos
            </h3>
            <p className="text-gray-600">
              Bordados, patches e acabamentos idênticos aos originais. Qualidade
              que você pode ver e sentir.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Camisas Importadas
            </h3>
            <p className="text-gray-600">
              Nossas camisas são importadas, com entrega rápida, segura e com
              agilidade em todo o Brasil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Why Choose Thai Quality - Nova seção
function WhyChooseThaiQualitySection() {
  const benefits = [
    {
      icon: <Check className="w-8 h-8" />,
      title: 'Qualidade Comprovada',
      description:
        'Camisas produzidas nas mesmas fábricas que confeccionam para grandes marcas. Qualidade AAA+ garantida.',
      color: 'bg-green-100 text-green-800',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Preço Acessível',
      description:
        'A mesma qualidade premium por um preço justo. Sem taxa de marca, só qualidade pura.',
      color: 'bg-secondary-100 text-secondary-800',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Sempre Atualizado',
      description:
        'Lançamentos rápidos e estoque sempre renovado com as últimas temporadas dos seus times.',
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
            Especialistas em camisas tailandesas de primeira linha para
            verdadeiros apaixonados por futebol
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

// Resto dos componentes mantidos...
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm p-6 animate-pulse"
        >
          <div className="space-y-3">
            <div className="bg-gray-200 h-64 rounded-xl mb-4"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4"></div>
            <div className="bg-gray-200 h-4 rounded w-1/2"></div>
            <div className="bg-gray-200 h-6 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

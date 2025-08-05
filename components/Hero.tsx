import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900" />

      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-secondary-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 mb-6">
            <span className="text-2xl">⚽</span>
            <span className="text-white font-medium">
              Camisas Oficiais Premium
            </span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
          O Vestiário
          <span className="block text-3xl md:text-5xl text-accent-400 font-light mt-2 tracking-wide">
            Sua Paixão, Nossa Qualidade
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Encontre as camisas oficiais dos maiores clubes do mundo.
          <span className="text-accent-400 font-semibold">
            {' '}
            Qualidade autêntica
          </span>
          , entrega rápida e{' '}
          <span className="text-secondary-400">preços especiais</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            href="#produtos"
            className="group bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-secondary-500/25"
          >
            <span className="flex items-center justify-center gap-2">
              Ver Produtos
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </span>
          </Link>
          <Link
            href="/sobre"
            className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-accent-400/50 hover:text-accent-400"
          >
            Sobre Nós
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-accent-400 mb-2">
              500+
            </div>
            <div className="text-gray-400 font-medium">Camisas Disponíveis</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-accent-400 mb-2">
              50+
            </div>
            <div className="text-gray-400 font-medium">Times Oficiais</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-accent-400 mb-2">
              10k+
            </div>
            <div className="text-gray-400 font-medium">
              Clientes Satisfeitos
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-accent-400 mb-2">
              24h
            </div>
            <div className="text-gray-400 font-medium">Entrega Expressa</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-accent-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

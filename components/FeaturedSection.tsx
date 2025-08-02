import Image from 'next/image';
import Link from 'next/link';

export default function FeaturedSection() {
  const featuredLeagues = [
    {
      name: 'Premier League',
      description: 'O melhor do futebol inglês',
      image: '/images/premier.png',
      gradient: 'from-purple-600 to-blue-600'
    },
    {
      name: 'La Liga',
      description: 'Tradição e técnica espanhola',
      image: '/images/laliga.png',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      name: 'Serie A',
      description: 'A arte do futebol italiano',
      image: '/images/seriea.png',
      gradient: 'from-green-600 to-blue-600'
    },
    {
      name: 'Bundesliga',
      description: 'Força e tradição alemã',
      image: '/images/bundesliga.png',
      gradient: 'from-red-600 to-yellow-500'
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Principais Ligas
          </h2>
          <p className="text-xl text-gray-600">
            Escolha sua liga favorita e encontre a camisa do seu time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredLeagues.map((league) => (
            <Link
              key={league.name}
              href={`/?categoria=${encodeURIComponent(league.name)}`}
              aria-label={`Ver camisas da ${league.name}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/5] shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <Image
                  src={league.image}
                  alt={league.name}
                  fill
                  className="object-cover z-0"
                  priority={false}
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                {/* Optional gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${league.gradient} opacity-70`} />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 group-hover:scale-105 transition-transform">
                  {league.name}
                </h3>
                <p className="text-white/80 mb-4">{league.description}</p>
                <div className="flex items-center text-sm font-medium group-hover:translate-x-2 transition-transform">
                  Ver camisas
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

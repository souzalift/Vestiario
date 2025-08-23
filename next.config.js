/** @type {import('next').NextConfig} */
const nextConfig = {
  // As suas configurações existentes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },

  // A regra de reescrita para o Firebase deve estar aqui dentro
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: 'https://o-vestiario-67951.firebaseapp.com/__/auth/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

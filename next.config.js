/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

// Rewrites for Firebase Hosting integration
rewrites: () => ({
  fallback: [
    {
      source: '/__/:path*',
      destination: 'https://o-vestiario-67951.firebaseapp.com/__/:path*',
    },
  ],
});

module.exports = nextConfig;

import type { Metadata, Viewport } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';

import { Poppins, Oswald } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

// Vercel
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

// Context Providers
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';

// Components
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DynamicTitle from '@/components/DynamicTitle';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});
const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '700'], // Pesos comummente usados para títulos
  variable: '--font-oswald',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'O Vestiário - Camisas Tailandesas',
    template: '%s | O Vestiário',
  },
  description:
    'O Vestiário - Camisas Tailandesas de alta qualidade. Não vendemos produtos oficiais.',
  keywords: [
    'camisas tailandesas',
    'camisas de futebol',
    'camisas de clubes',
    'camisas de times',
    'futebol',
    'esportes',
  ],
  authors: [{ name: 'O Vestiário' }],
  creator: 'O Vestiário',
  publisher: 'O Vestiário',
  openGraph: {
    title: 'O Vestiário - Camisas Tailandesas',
    description:
      'Camisas tailandesas de alta qualidade inspiradas nos maiores clubes do mundo. Não vendemos produtos oficiais.',
    url: 'https://ovestiario.com.br',
    siteName: 'O Vestiário',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#111827',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      {/* 3. Adicione a variável da nova fonte ao className do body */}
      <body
        className={`${poppins.variable} ${oswald.variable} font-sans bg-gray-50 text-gray-800 min-h-screen flex flex-col`}
      >
        <SpeedInsights />
        <Analytics />
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <DynamicTitle />
              <Toaster
                position="top-right"
                richColors
                closeButton
                expand={false}
              />
              <Header />
              <div className="w-full bg-yellow-100 text-yellow-900 text-center py-2 text-sm font-medium border-b border-yellow-300">
                Atenção: Trabalhamos apenas com camisas tailandesas de alta
                qualidade. Não vendemos produtos oficiais/licenciados.
              </div>
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </body>
      <GoogleAnalytics gaId="G-F48CLM2VP0" />
    </html>
  );
}

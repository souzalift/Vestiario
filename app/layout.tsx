import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'O Vestiário',
  description: 'O Vestiário - Camisas Tailandesas',
  keywords: [
    'camisas tailandesas',
    'camisas de futebol',
    'camisas de clubes',
    'camisas de times',
    'futebol',
    'esportes',
    'não oficiais',
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
  userScalable: false,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.variable} antialiased`}>
        <CartProvider>
          <AuthProvider>
            <Header />
            {/* AVISO DE PRODUTO NÃO OFICIAL */}
            <div className="w-full bg-yellow-100 text-yellow-900 text-center py-2 text-sm font-medium border-b border-yellow-300">
              Atenção: Trabalhamos apenas com camisas tailandesas de alta
              qualidade. Não vendemos produtos oficiais/licenciados.
            </div>
            {children}
          </AuthProvider>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

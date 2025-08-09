import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'O Vestiário',
  description:
    'Camisas oficiais dos maiores clubes do mundo com qualidade autêntica',
  keywords: [
    'camisas de futebol',
    'camisas oficiais',
    'clubes',
    'futebol',
    'esportes',
  ],
  authors: [{ name: 'O Vestiário' }],
  creator: 'O Vestiário',
  publisher: 'O Vestiário',
  openGraph: {
    title: 'O Vestiário - Camisas Oficiais',
    description: 'Camisas oficiais dos maiores clubes do mundo',
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

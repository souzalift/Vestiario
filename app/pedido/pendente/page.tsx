'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Clock,
  AlertCircle,
  Package,
  ArrowLeft,
  RefreshCw,
  Loader2,
} from 'lucide-react';

// Componente que usa useSearchParams
function PendingContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-6 flex items-center justify-center">
        <Clock className="w-8 h-8 text-yellow-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Pagamento Pendente
      </h1>

      <p className="text-gray-600 mb-6">
        Seu pedido{' '}
        {orderNumber && (
          <span className="font-mono bg-yellow-100 px-2 py-1 rounded text-sm text-yellow-700">
            #{orderNumber}
          </span>
        )}{' '}
        foi criado, mas o pagamento ainda está sendo processado.
      </p>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
        <h3 className="font-medium text-yellow-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />O que isso significa?
        </h3>
        <ul className="text-sm text-yellow-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 font-bold">•</span>
            <span>
              Pagamento por PIX pode levar alguns minutos para confirmar
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 font-bold">•</span>
            <span>Boleto bancário pode levar até 3 dias úteis</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 font-bold">•</span>
            <span>Cartão de crédito normalmente é instantâneo</span>
          </li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">📧 Fique tranquilo</h4>
        <p className="text-sm text-blue-700">
          Assim que confirmarmos o pagamento, você receberá um e-mail de
          confirmação e seu pedido entrará na fila de produção.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Verificar Status
        </button>

        <Link href="/contato" className="block">
          <button className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            <Package className="w-4 h-4" />
            Precisa de Ajuda?
          </button>
        </Link>

        <Link href="/" className="block">
          <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar à Loja
          </button>
        </Link>
      </div>

      {orderNumber && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 text-center">
            Número do pedido: <span className="font-mono">{orderNumber}</span>
            <br />
            Acompanhe o status do seu pagamento
          </p>
        </div>
      )}
    </div>
  );
}

// Componente de loading
function PendingPageLoading() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
      </div>
    </div>
  );
}

// Componente principal
export default function PendentePedidoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Suspense fallback={<PendingPageLoading />}>
            <PendingContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import {
  CheckCircle,
  Package,
  Clock,
  ArrowLeft,
  Share2,
  Loader2,
} from 'lucide-react';

// Componente que usa useSearchParams
function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Pedido Realizado com Sucesso! 🎉
      </h1>

      <p className="text-gray-600 mb-6">
        Obrigado pela sua compra! Seu pedido{' '}
        {orderNumber && (
          <span className="font-mono bg-green-100 px-2 py-1 rounded text-sm text-green-700">
            #{orderNumber}
          </span>
        )}{' '}
        foi confirmado e está sendo processado.
      </p>

      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
        <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Próximos passos:
        </h3>
        <ul className="text-sm text-green-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">1.</span>
            <span>Você receberá um e-mail de confirmação em instantes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">2.</span>
            <span>Seu pedido será preparado em até 3 dia úteis</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">3.</span>
            <span>Você receberá o código de rastreamento por e-mail</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">4.</span>
            <span>Prazo de entrega: 10 a 15 dias úteis</span>
          </li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Acompanhe seu pedido
        </h4>
        <p className="text-sm text-blue-700">
          Em breve você poderá acompanhar o status do seu pedido na área do
          cliente. Mantenha o número do pedido para referência.
        </p>
      </div>

      <div className="space-y-3">
        <Link href="/" className="block">
          <button className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            <Package className="w-4 h-4" />
            Continuar Comprando
          </button>
        </Link>

        <button
          onClick={() => {
            if (navigator.share && orderNumber) {
              navigator.share({
                title: 'Minha compra no O Vestiário',
                text: `Acabei de comprar no O Vestiário! Pedido #${orderNumber}`,
                url: window.location.href,
              });
            }
          }}
          className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Compartilhar
        </button>

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
            Guarde este número para acompanhar sua entrega
          </p>
        </div>
      )}
    </div>
  );
}

// Componente de loading
function SuccessPageLoading() {
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
export default function SucessoPedidoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Suspense fallback={<SuccessPageLoading />}>
            <SuccessContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

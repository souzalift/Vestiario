'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import {
  XCircle,
  RefreshCw,
  ArrowLeft,
  HelpCircle,
  Loader2,
} from 'lucide-react';

// Componente que usa useSearchParams
function ErrorContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
        <XCircle className="w-8 h-8 text-red-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Problema no Pagamento
      </h1>

      <p className="text-gray-600 mb-6">
        Não foi possível processar o pagamento do seu pedido{' '}
        {orderNumber && (
          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
            #{orderNumber}
          </span>
        )}
        . Isso pode ter acontecido por diversos motivos.
      </p>

      <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Possíveis causas:
        </h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Dados do cartão incorretos ou vencidos</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Limite de crédito insuficiente</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Problema temporário com o processador de pagamento</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Transação bloqueada pelo banco emissor</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span>CPF informado incorretamente</span>
          </li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">💡 Dica</h4>
        <p className="text-sm text-blue-700">
          Verifique os dados do seu cartão e tente novamente. Se o problema
          persistir, entre em contato com seu banco ou experimente outro método
          de pagamento.
        </p>
      </div>

      <div className="space-y-3">
        <Link href="/carrinho" className="block">
          <button className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </button>
        </Link>

        <Link href="/contato" className="block">
          <button className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            <HelpCircle className="w-4 h-4" />
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
            Guarde este número para referência futura
          </p>
        </div>
      )}
    </div>
  );
}

// Componente de loading para o Suspense
function ErrorPageLoading() {
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
export default function ErroPedidoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Suspense fallback={<ErrorPageLoading />}>
            <ErrorContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

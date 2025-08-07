'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  XCircle,
  RefreshCw,
  ArrowLeft,
  HelpCircle,
  CreditCard,
} from 'lucide-react';

export default function ErroPedidoPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Problema no Pagamento
            </h1>

            <p className="text-gray-600 mb-6">
              Não foi possível processar o pagamento do seu pedido{' '}
              {orderNumber && `#${orderNumber}`}. Isso pode ter acontecido por
              diversos motivos.
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-medium text-gray-900 mb-3">
                Possíveis causas:
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Dados do cartão incorretos</li>
                <li>• Limite de crédito insuficiente</li>
                <li>• Problema temporário com o processador</li>
                <li>• Transação bloqueada pelo banco</li>
              </ul>
            </div>

            <div className="space-y-4">
              <Link href="/carrinho">
                <button className="w-full bg-primary-800 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Tentar Novamente
                </button>
              </Link>

              <Link href="/contato">
                <button className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Precisa de Ajuda?
                </button>
              </Link>

              <Link href="/">
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar à Loja
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

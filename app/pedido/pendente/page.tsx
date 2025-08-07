'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Clock, CreditCard, FileText, RefreshCw, Home } from 'lucide-react';

export default function PendentePedidoPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Pagamento Pendente
            </h1>

            <p className="text-gray-600 mb-6">
              Seu pedido {orderNumber && `#${orderNumber}`} foi criado com
              sucesso! Estamos aguardando a confirmação do pagamento.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-medium text-yellow-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />O que fazer agora?
              </h3>
              <div className="text-sm text-yellow-800 space-y-2">
                <p>
                  • Se você escolheu <strong>PIX</strong>, efetue o pagamento
                  usando o QR Code ou código
                </p>
                <p>
                  • Se escolheu <strong>Boleto</strong>, realize o pagamento até
                  o vencimento
                </p>
                <p>
                  • Para <strong>cartão</strong>, aguarde a confirmação
                  automática
                </p>
                <p>
                  • Você receberá uma confirmação por email quando o pagamento
                  for aprovado
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Link href="/perfil/pedidos">
                <button className="w-full bg-primary-800 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Acompanhar Pedido
                </button>
              </Link>

              <Link href="/">
                <button className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                  <Home className="w-4 h-4" />
                  Continuar Comprando
                </button>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Em caso de dúvidas, entre em contato conosco pelo WhatsApp ou
                email. Seu pedido será cancelado automaticamente se o pagamento
                não for confirmado em 24 horas.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

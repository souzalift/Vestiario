'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, AlertCircle, Home, Package } from 'lucide-react';

export default function PendentePage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Card>
            <CardContent className="p-12">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-6">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Pagamento Pendente
              </h1>

              <p className="text-gray-600 mb-2">
                Seu pagamento está sendo processado.
              </p>

              <p className="text-sm text-gray-500 mb-8">
                {status && `Status: ${status}`}
                {paymentId && ` • ID: ${paymentId}`}
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm text-yellow-800 font-medium mb-2">
                      O que acontece agora?
                    </p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Aguarde a confirmação do pagamento</li>
                      <li>• Você receberá um e-mail quando for aprovado</li>
                      <li>• Pode levar até 3 dias úteis</li>
                      <li>• Acompanhe o status em Meus Pedidos</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/meus-pedidos">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Package className="h-4 w-4 mr-2" />
                    Acompanhar Pedido
                  </Button>
                </Link>

                <Link href="/">
                  <Button variant="outline">
                    <Home className="h-4 w-4 mr-2" />
                    Continuar Comprando
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-gray-500 mt-6">
                Em caso de dúvidas, entre em contato conosco
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

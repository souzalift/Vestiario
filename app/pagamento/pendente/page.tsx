'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, AlertCircle } from 'lucide-react';

export default function PendingPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-6">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Pagamento Pendente
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Seu pagamento está sendo processado. Você receberá uma confirmação em breve.
              </p>

              {paymentId && (
                <div className="bg-gray-100 rounded-lg p-4 mb-8">
                  <p className="text-sm text-gray-600">
                    <strong>ID do Pagamento:</strong> {paymentId}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> {status}
                  </p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-left">
                    <h3 className="font-semibold text-yellow-800 mb-2">O que acontece agora?</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Para boleto: Aguarde até 3 dias úteis após o pagamento</li>
                      <li>• Para PIX: Confirmação em até 1 hora</li>
                      <li>• Para transferência: Aguarde a compensação bancária</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Continuar Comprando
                  </Button>
                </Link>
                <Link href="/meus-pedidos">
                  <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                    Acompanhar Pedido
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
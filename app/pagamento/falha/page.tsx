'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function FailurePage() {
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
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Pagamento Não Autorizado
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Houve um problema com seu pagamento. Por favor, tente novamente ou use outro método de pagamento.
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
                <h3 className="font-semibold text-yellow-800 mb-2">Possíveis causas:</h3>
                <ul className="text-sm text-yellow-700 text-left space-y-1">
                  <li>• Dados do cartão incorretos</li>
                  <li>• Limite insuficiente</li>
                  <li>• Problemas na operadora</li>
                  <li>• Transação rejeitada pelo banco</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/carrinho">
                  <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar ao Carrinho
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Ir para Loja
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
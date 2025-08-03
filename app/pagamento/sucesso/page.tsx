'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Package, Truck } from 'lucide-react';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    // Aqui você pode fazer uma chamada para salvar o pedido no banco de dados
    console.log('Payment successful:', { paymentId, status, externalReference });
  }, [paymentId, status, externalReference]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Pagamento Confirmado!
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Seu pedido foi processado com sucesso. Você receberá um e-mail de confirmação em breve.
              </p>

              {paymentId && (
                <div className="bg-gray-100 rounded-lg p-4 mb-8">
                  <p className="text-sm text-gray-600">
                    <strong>ID do Pagamento:</strong> {paymentId}
                  </p>
                  {externalReference && (
                    <p className="text-sm text-gray-600">
                      <strong>Número do Pedido:</strong> {externalReference}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center justify-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                  <div className="text-left">
                    <p className="font-semibold text-blue-900">Preparação</p>
                    <p className="text-sm text-blue-600">1-2 dias úteis</p>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <Truck className="h-6 w-6 text-green-600" />
                  <div className="text-left">
                    <p className="font-semibold text-green-900">Entrega</p>
                    <p className="text-sm text-green-600">5-7 dias úteis</p>
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
                    Ver Meus Pedidos
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
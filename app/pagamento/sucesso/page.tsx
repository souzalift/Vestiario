'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Package, Home } from 'lucide-react';

export default function SucessoPage() {
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const lastOrder = localStorage.getItem('lastOrder');
    if (lastOrder) {
      setOrderData(JSON.parse(lastOrder));
      localStorage.removeItem('lastOrder');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Card>
            <CardContent className="p-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Pagamento Aprovado!
              </h1>

              <p className="text-gray-600 mb-8">
                Seu pedido foi confirmado e será processado em breve. Você
                receberá um e-mail com os detalhes do pedido.
              </p>

              {orderData && (
                <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                  <h3 className="font-semibold mb-4">Detalhes do Pedido:</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Total:</strong> R$ {orderData.total?.toFixed(2)}
                    </p>
                    <p>
                      <strong>Itens:</strong> {orderData.items?.length}{' '}
                      produto(s)
                    </p>
                    <p>
                      <strong>Entrega:</strong>{' '}
                      {orderData.shippingAddress?.city},{' '}
                      {orderData.shippingAddress?.state}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Home className="h-4 w-4 mr-2" />
                    Continuar Comprando
                  </Button>
                </Link>

                <Link href="/meus-pedidos">
                  <Button variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Meus Pedidos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

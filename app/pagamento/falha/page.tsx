'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle, ArrowLeft, CreditCard, Home } from 'lucide-react';

export default function ErroPage() {
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
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Pagamento Não Aprovado
              </h1>

              <p className="text-gray-600 mb-2">
                Houve um problema com seu pagamento.
              </p>

              <p className="text-sm text-gray-500 mb-8">
                {status && `Status: ${status}`}
                {paymentId && ` • ID: ${paymentId}`}
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-red-800">
                  <strong>Possíveis causas:</strong>
                </p>
                <ul className="text-sm text-red-700 mt-2 list-disc list-inside text-left">
                  <li>Dados do cartão incorretos</li>
                  <li>Limite insuficiente</li>
                  <li>Problemas com a operadora</li>
                  <li>Cancelamento pelo usuário</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/pagamento">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </Link>

                <Link href="/carrinho">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar ao Carrinho
                  </Button>
                </Link>

                <Link href="/">
                  <Button variant="ghost">
                    <Home className="h-4 w-4 mr-2" />
                    Início
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

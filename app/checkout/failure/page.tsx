import Header from '@/components/Header';
import { XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CheckoutFailurePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm-px-6 lg:px-8 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Pagamento Recusado
            </h1>
            <p className="text-gray-600 mb-8">
              Houve um problema com o processamento do seu pagamento. Por favor, tente novamente ou use outro método de pagamento.
            </p>
            <div className="space-y-4">
              <Link href="/carrinho">
                <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                  Tentar Novamente
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full md:w-auto">
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
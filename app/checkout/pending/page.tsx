import Header from '@/components/Header';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CheckoutPendingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Pagamento Pendente
            </h1>
            <p className="text-gray-600 mb-8">
              Seu pagamento está sendo processado. Você receberá uma confirmação por e-mail assim que for aprovado.
            </p>
            <div className="space-y-4">
              <Link href="/">
                <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                  Continuar Comprando
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
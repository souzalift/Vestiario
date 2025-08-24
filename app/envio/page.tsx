// app/politica-de-envio/page.tsx
import { Globe, Clock, Truck, Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Envio',
  description:
    'Entenda como funciona o nosso processo de envio, prazos e rastreio.',
};

export default function PoliticaEnvioPage() {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Política de Envio
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Entenda como funciona o nosso processo de envio para garantir que a
            sua camisa chegue até si com segurança e no prazo estimado.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-8 rounded-2xl border">
            <Globe className="w-8 h-8 text-indigo-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-900">
              Origem dos Produtos
            </h2>
            <p className="mt-2 text-gray-600">
              Para garantir a máxima qualidade com o melhor preço, todos os
              nossos produtos são <strong>importados</strong> e enviados
              diretamente dos nossos centros de distribuição parceiros na Ásia.
            </p>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl border">
            <Clock className="w-8 h-8 text-indigo-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-900">
              Prazos de Entrega
            </h2>
            <p className="mt-2 text-gray-600">
              <strong>Processamento:</strong> 2 a 5 dias úteis após o pagamento.
            </p>
            <p className="mt-1 text-gray-600">
              <strong>Entrega:</strong> 15 a 25 dias úteis após o envio.
            </p>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl border">
            <Truck className="w-8 h-8 text-indigo-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-900">
              Rastreamento do Pedido
            </h2>
            <p className="mt-2 text-gray-600">
              Assim que o seu pedido for despachado, você receberá um{' '}
              <strong>código de rastreio</strong> por email. O código pode levar
              de 2 a 4 dias úteis para apresentar as primeiras atualizações.
            </p>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl border">
            <Shield className="w-8 h-8 text-indigo-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-900">
              Alfândega e Impostos
            </h2>
            <p className="mt-2 text-gray-600">
              Nós cuidamos de todo o processo.{' '}
              <strong>Você não terá custos adicionais</strong> com taxas
              alfandegárias ou impostos. O valor do checkout é o valor final.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

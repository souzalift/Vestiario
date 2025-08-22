// app/garantia/page.tsx
import { Check, X, Mail } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Garantia de Qualidade',
  description:
    'Conheça a nossa garantia de 30 dias contra defeitos de fabrico.',
};

export default function GarantiaPage() {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Garantia de Qualidade
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            No O Vestiário, temos orgulho da qualidade dos nossos produtos.
            Todas as nossas camisas são selecionadas para garantir que você
            receba uma peça impecável.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* O que cobre */}
          <div className="bg-green-50 border border-green-200 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-green-900 flex items-center gap-3">
              <Check className="w-6 h-6" /> O que a nossa Garantia Cobre?
            </h2>
            <p className="mt-4 text-green-800">
              Oferecemos uma garantia de <strong>30 dias</strong> contra{' '}
              <strong>defeitos de fabrico</strong>. Esta garantia cobre:
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-green-800">
              <li>Costuras defeituosas.</li>
              <li>Erros na aplicação de nomes, números ou patches.</li>
              <li>Manchas ou danos no tecido não causados por mau uso.</li>
            </ul>
          </div>

          {/* O que NÃO cobre */}
          <div className="bg-red-50 border border-red-200 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-red-900 flex items-center gap-3">
              <X className="w-6 h-6" /> O que a Garantia NÃO Cobre?
            </h2>
            <p className="mt-4 text-red-800">
              A nossa garantia não se aplica a danos causados por:
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-red-800">
              <li>Uso indevido do produto (rasgos, furos, etc.).</li>
              <li>Desgaste natural devido ao uso contínuo.</li>
              <li>Danos ocorridos durante a lavagem.</li>
              <li>Produtos personalizados aprovados pelo cliente.</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 bg-gray-50 p-8 rounded-2xl border">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Mail className="w-6 h-6 text-indigo-600" /> Como Acionar a Garantia
          </h2>
          <p className="mt-4 text-gray-600">
            Se acredita que o seu produto tem um defeito de fabrico, envie um
            email para <strong>contato@ovestiario.com.br</strong> em até 30 dias
            após o recebimento. Inclua o número do seu pedido, uma descrição
            clara do defeito e anexe fotos ou vídeos que mostrem o problema.
          </p>
        </div>
      </div>
    </div>
  );
}

// app/trocas-e-devolucoes/page.tsx
import { RefreshCw, Package, ShieldAlert, CreditCard } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trocas e Devoluções',
  description: 'Conheça a nossa política de trocas e devoluções.',
};

export default function TrocasDevolucoesPage() {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Política de Trocas e Devoluções
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            A sua satisfação é o nosso compromisso. Se precisar trocar ou
            devolver um produto, criámos uma política clara e simples para
            ajudá-lo.
          </p>
        </div>

        <div className="mt-16 space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-indigo-600" /> Prazo para
              Solicitação
            </h2>
            <p className="mt-4 text-gray-600 leading-7">
              O prazo para solicitar a troca ou devolução do seu produto é de{' '}
              <strong>7 (sete) dias corridos</strong> após o recebimento,
              conforme o Código de Defesa do Consumidor.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-6 h-6 text-indigo-600" /> Condições para
              Troca ou Devolução
            </h2>
            <p className="mt-4 text-gray-600 leading-7">
              Para que a sua solicitação seja aceite, o produto deve atender aos
              seguintes critérios:
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600">
              <li>
                Estar em perfeito estado, sem sinais de uso, lavagem ou qualquer
                tipo de dano.
              </li>
              <li>Manter a etiqueta original afixada à peça.</li>
              <li>Ser devolvido na sua embalagem original.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-red-600" /> Atenção para
              Produtos Personalizados
            </h2>
            <p className="mt-4 text-gray-600 leading-7">
              Produtos personalizados (com nome, número ou patches){' '}
              <strong>não são elegíveis para troca ou devolução</strong>, exceto
              em caso de defeito de fabrico.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-indigo-600" /> Reembolso
            </h2>
            <p className="mt-4 text-gray-600 leading-7">
              Após o recebimento e a verificação do produto devolvido, o
              reembolso será processado da seguinte forma:
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600">
              <li>
                <strong>Cartão de Crédito:</strong> O estorno será solicitado à
                administradora do cartão e poderá aparecer na sua fatura em até
                2 (duas) faturas subsequentes.
              </li>
              <li>
                <strong>PIX ou Boleto:</strong> O valor será reembolsado via PIX
                para a conta de sua preferência em até 5 dias úteis.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

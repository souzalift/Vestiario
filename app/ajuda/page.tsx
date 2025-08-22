// app/central-de-ajuda/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Central de Ajuda',
  description:
    'Encontre respostas para as perguntas mais frequentes sobre produtos, pagamentos e envios.',
};

const faqs = [
  {
    category: 'Sobre os Produtos',
    questions: [
      {
        q: 'As camisas são originais?',
        a: 'Trabalhamos com produtos de qualidade tailandesa 1:1, a melhor versão disponível no mercado. Elas são importadas e oferecem um acabamento, tecidos e detalhes idênticos aos produtos oficiais, com um custo-benefício superior. Não vendemos produtos licenciados/oficiais.',
      },
      {
        q: 'Posso personalizar a minha camisa com nome e número?',
        a: 'Sim! Oferecemos o serviço de personalização para a maioria das nossas camisas. Na página do produto, você encontrará as opções para adicionar nome e número.',
      },
    ],
  },
  {
    category: 'Pedidos e Pagamento',
    questions: [
      {
        q: 'Quais são as formas de pagamento aceites?',
        a: 'Aceitamos pagamentos via PIX, Boleto Bancário e Cartão de Crédito, processados de forma 100% segura através do Mercado Pago.',
      },
      {
        q: 'Como sei que o meu pagamento foi aprovado?',
        a: 'Você receberá um email de confirmação assim que o pagamento for processado. Para pagamentos via PIX e Cartão de Crédito, a aprovação costuma ser imediata. Para boletos, pode levar até 2 dias úteis.',
      },
    ],
  },
  {
    category: 'Envio e Rastreio',
    questions: [
      {
        q: 'Qual é o prazo de entrega?',
        a: 'O prazo de entrega padrão é de 5 a 7 dias úteis após a confirmação do pagamento. Este prazo pode variar ligeiramente dependendo da sua localidade.',
      },
      {
        q: 'Como posso rastrear o meu pedido?',
        a: 'Assim que o seu pedido for enviado, você receberá um email com o código de rastreio. Pode usar este código no nosso site, na página "Rastrear Pedido", ou diretamente no site dos Correios.',
      },
    ],
  },
];

export default function CentralAjudaPage() {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Central de Ajuda
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Encontre aqui as respostas para as perguntas mais frequentes.
          </p>
        </div>

        <div className="mt-16 space-y-12">
          {faqs.map((faqCategory) => (
            <div key={faqCategory.category}>
              <h2 className="text-2xl font-bold text-gray-900 border-b pb-4 mb-6">
                {faqCategory.category}
              </h2>
              <dl className="space-y-8">
                {faqCategory.questions.map((faq) => (
                  <div key={faq.q}>
                    <dt className="text-lg font-semibold text-gray-800">
                      {faq.q}
                    </dt>
                    <dd className="mt-2 text-base text-gray-600">{faq.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-gray-50 p-8 rounded-2xl border">
          <h3 className="text-xl font-bold text-gray-900">
            Ainda tem dúvidas?
          </h3>
          <p className="mt-2 text-gray-600">
            A nossa equipa de atendimento está pronta para ajudar.
          </p>
          <Button asChild className="mt-6">
            <Link href="/contato">Fale Conosco</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

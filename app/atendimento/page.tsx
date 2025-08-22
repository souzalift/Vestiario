// app/atendimento/page.tsx
import { Clock, MessageCircle, Mail, Instagram } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Atendimento',
  description: 'Canais e horários de atendimento do O Vestiário.',
};

export default function AtendimentoPage() {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Atendimento ao Cliente
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            A sua satisfação é a nossa prioridade. Confira os nossos canais e
            horários de atendimento.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Clock className="w-6 h-6 text-indigo-600" /> Horário de
              Atendimento
            </h2>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>
                <strong>Segunda a Sexta-feira:</strong> das 9:00 às 18:00
                (exceto feriados)
              </li>
              <li>
                <strong>Sábados:</strong> das 9:00 às 13:00
              </li>
            </ul>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Canais de Contato
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" /> WhatsApp
                </h3>
                <p className="text-sm text-gray-600">
                  Atendimento rápido para dúvidas sobre produtos e status de
                  pedidos.
                </p>
                <p className="text-sm text-gray-500">
                  Tempo de Resposta: Geralmente em poucos minutos.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-600" /> Email
                </h3>
                <p className="text-sm text-gray-600">
                  Para questões detalhadas, trocas, devoluções ou parcerias.
                </p>
                <p className="text-sm text-gray-500">
                  Tempo de Resposta: Até 24 horas úteis.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-pink-600" /> Redes Sociais
                </h3>
                <p className="text-sm text-gray-600">
                  Siga-nos para novidades e promoções!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

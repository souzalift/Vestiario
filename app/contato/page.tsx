// app/contato/page.tsx
import { Mail, MessageCircle, MapPin } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Entre em contato com a equipe do O Vestiário.',
};

export default function ContatoPage() {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Fale Conosco
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Tem alguma dúvida, sugestão ou precisa de ajuda com o seu pedido? A
            nossa equipa está pronta para atendê-lo!
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Email */}
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Email</h2>
            </div>
            <p className="mt-4 text-gray-600">
              Para dúvidas gerais, parcerias ou questões sobre pedidos, envie um
              email para:
            </p>
            <a
              href="mailto:contato@ovestiario.com.br"
              className="mt-2 inline-block font-semibold text-indigo-600 hover:text-indigo-500"
            >
              contato@ovestiario.com.br
            </a>
            <p className="mt-2 text-sm text-gray-500">
              Respondemos em até 24 horas úteis.
            </p>
          </div>

          {/* WhatsApp */}
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 text-green-600 p-3 rounded-full">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">WhatsApp</h2>
            </div>
            <p className="mt-4 text-gray-600">
              Para um atendimento mais rápido e personalizado, fale conosco pelo
              WhatsApp:
            </p>
            <a
              href="https://wa.me/5571982400893"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-semibold text-green-600 hover:text-green-500"
            >
              (71) 98240-0893
            </a>
            <p className="mt-2 text-sm text-gray-500">
              Atendimento de Segunda a Sexta, das 9h às 18h.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-600">
          <MapPin className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p>O Vestiário é uma loja 100% online, sem atendimento presencial.</p>
          <p className="text-sm">
            Base administrativa em Salvador, Bahia, Brasil.
          </p>
        </div>
      </div>
    </div>
  );
}

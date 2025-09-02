'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SiWhatsapp } from 'react-icons/si';

export default function ContactCTA() {
  // Substitua pelo seu número de WhatsApp real
  const whatsappNumber = '5571982400893';
  const whatsappMessage =
    'Olá! Gostaria de encomendar uma camisa que não encontrei no site.';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage,
  )}`;

  return (
    <section className="bg-gradient-to-br from-gray-900 to-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <Badge
            variant="secondary"
            className="mb-4 bg-white/10 text-white border-white/20"
          >
            Pedidos Especiais
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-4 font-heading uppercase tracking-wider">
            Não achou a camisa que procurava?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            O nosso stock é atualizado constantemente, mas se tem um pedido
            especial ou uma camisa rara em mente, fale connosco! Faremos o nosso
            melhor para a encontrar para si.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white font-bold text-lg px-8 py-6"
          >
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <SiWhatsapp className="w-6 h-6 mr-3" />
              Fale Conosco no WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

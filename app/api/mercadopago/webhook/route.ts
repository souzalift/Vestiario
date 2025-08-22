// app/api/mercadopago/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { updateOrderStatus } from '@/services/orders';
import type { Order } from '@/services/orders';

// Inicialize o cliente do Mercado Pago com sua chave de acesso
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    // 1. Recebe a notificação do Mercado Pago
    const body = await request.json();
    console.log('🔔 Webhook do Mercado Pago recebido:', body);

    // O webhook envia diferentes tipos de notificações. Estamos interessados no pagamento.
    if (body.type === 'payment') {
      const paymentId = body.data.id;

      // 2. Busca os detalhes completos do pagamento usando o ID recebido
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: paymentId });

      console.log('🔍 Detalhes do pagamento:', paymentInfo);

      // 3. Extrai as informações importantes
      const orderId = paymentInfo.external_reference;
      const paymentStatus = paymentInfo.status; // ex: "approved", "rejected", "in_process"

      if (!orderId) {
        // Se não houver external_reference, não podemos associar a um pedido.
        // Isso pode acontecer em testes ou pagamentos não iniciados pelo seu site.
        console.warn('⚠️ Webhook recebido sem external_reference (ID do pedido). Ignorando.');
        return NextResponse.json({ status: 'ok', message: 'Webhook received but no order ID found.' });
      }

      // 4. Mapeia o status do Mercado Pago para o status do seu sistema
      let newOrderStatus: Order['status'] = 'pendente';
      let newPaymentStatus: Order['paymentStatus'] = 'pending';

      switch (paymentStatus) {
        case 'approved':
          newOrderStatus = 'pago';
          newPaymentStatus = 'paid';
          break;
        case 'rejected':
        case 'cancelled':
          newOrderStatus = 'cancelado';
          newPaymentStatus = 'failed';
          break;
        // Você pode adicionar outros casos se quiser, como 'in_process' para 'pendente'
        default:
          // Mantém o status como pendente para outros casos
          break;
      }

      console.log(`🔄 Atualizando pedido ${orderId} para status: ${newOrderStatus} e paymentStatus: ${newPaymentStatus}`);

      // 5. Atualiza o pedido no seu banco de dados (Firestore)
      await updateOrderStatus(orderId, newOrderStatus, newPaymentStatus);

      console.log(`✅ Pedido ${orderId} atualizado com sucesso!`);
    }

    // 6. Responde ao Mercado Pago com status 200 OK para confirmar o recebimento
    return NextResponse.json({ status: 'ok' });

  } catch (error: any) {
    console.error('❌ Erro no webhook do Mercado Pago:', error);
    // Retorna um erro, mas para o Mercado Pago, é melhor ainda responder 200
    // para evitar que ele continue tentando enviar a mesma notificação.
    // O erro já foi logado no seu servidor para análise.
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}

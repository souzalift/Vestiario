// app/api/mercadopago/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { updateOrderStatus } from '@/services/orders';
import type { Order } from '@/services/orders';

// Inicialize o cliente do Mercado Pago com a sua chave de acesso
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
        console.warn('⚠️ Webhook recebido sem external_reference (ID do pedido). Ignorando.');
        return NextResponse.json({ status: 'ok' });
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
        // Adicione outros casos se necessário
      }

      console.log(`🔄 A atualizar pedido ${orderId} para status: ${newOrderStatus}`);

      // 5. Atualiza o pedido no seu banco de dados (Firestore)
      await updateOrderStatus(orderId, newOrderStatus, newPaymentStatus);

      console.log(`✅ Pedido ${orderId} atualizado com sucesso!`);
    }

    // 6. Responde ao Mercado Pago com status 200 OK para confirmar o recebimento
    return NextResponse.json({ status: 'ok' });

  } catch (error: any) {
    console.error('❌ Erro no webhook do Mercado Pago:', error);
    // CORREÇÃO: Responde 200 OK mesmo em caso de erro.
    // Isto confirma ao Mercado Pago que a notificação foi recebida.
    // O erro já foi registado nos seus logs de servidor para análise.
    return NextResponse.json({ status: 'error', message: error.message }, { status: 200 });
  }
}

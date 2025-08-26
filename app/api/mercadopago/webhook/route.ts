// app/api/mercadopago/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { updateOrderStatus } from '@/services/orders';
import type { Order } from '@/services/orders';

export async function POST(request: NextRequest) {
  // 1. Verificação da variável de ambiente ANTES de qualquer outra coisa
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('❌ ERRO CRÍTICO: A variável de ambiente MERCADO_PAGO_ACCESS_TOKEN não está configurada no servidor.');
    // Responde 200 ao Mercado Pago para evitar re-tentativas, mas regista o erro grave.
    return NextResponse.json({ status: 'error', message: 'Configuração do servidor incompleta.' }, { status: 200 });
  }

  // 2. Inicializa o cliente DENTRO da função, usando a chave validada
  const client = new MercadoPagoConfig({ accessToken });

  try {
    const body = await request.json();
    console.log('🔔 Webhook do Mercado Pago recebido:', body);

    if (body.type === 'payment') {
      const paymentId = body.data.id;

      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: paymentId });

      console.log('🔍 Detalhes do pagamento:', paymentInfo);

      const orderId = paymentInfo.external_reference;
      const paymentStatus = paymentInfo.status;

      if (!orderId) {
        console.warn('⚠️ Webhook recebido sem external_reference (ID do pedido). Ignorando.');
        return NextResponse.json({ status: 'ok' });
      }

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
      }

      console.log(`🔄 A atualizar pedido ${orderId} para status: ${newOrderStatus}`);
      await updateOrderStatus(orderId, newOrderStatus, newPaymentStatus);
      console.log(`✅ Pedido ${orderId} atualizado com sucesso!`);
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error: any) {
    console.error('❌ Erro ao processar o webhook do Mercado Pago:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 200 });
  }
}

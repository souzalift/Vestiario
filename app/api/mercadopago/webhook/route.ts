// app/api/mercadopago/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { updateOrderStatus } from '@/services/orders';
import type { Order } from '@/services/orders';
import crypto from 'crypto';

// Chave secreta para validar a assinatura do webhook
const WEBHOOK_SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

const getClient = () => {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('Chave de acesso do Mercado Pago não configurada.');
  }
  return new MercadoPagoConfig({ accessToken });
};

// Função para validar a assinatura do webhook
const validateSignature = (request: Request, payload: string) => {
  console.log('Iniciando validação da assinatura...');
  if (!WEBHOOK_SECRET) {
    console.warn('⚠️ A chave secreta do webhook não está configurada. A validação será ignorada (NÃO FAÇA ISTO EM PRODUÇÃO).');
    return true;
  }

  const signatureHeader = request.headers.get('x-signature');
  console.log(`Header x-signature recebido: ${signatureHeader}`);
  if (!signatureHeader) {
    console.error('❌ Header x-signature em falta.');
    return false;
  }

  const parts = signatureHeader.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    acc[key.trim()] = value.trim();
    return acc;
  }, {} as Record<string, string>);

  const ts = parts['ts'];
  const hash = parts['v1'];
  console.log(`Headers recebidos: { ts: '${ts}', v1: '${hash}' }`);

  if (!ts || !hash) {
    console.error("❌ Partes 'ts' ou 'v1' em falta no header da assinatura.");
    return false;
  }

  const manifest = `id:${JSON.parse(payload).data.id};request-id:${request.headers.get('x-request-id')};ts:${ts};`;
  console.log(`Manifesto criado para validação: ${manifest}`);

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  hmac.update(manifest);
  const expectedSignature = hmac.digest('hex');
  console.log(`Assinatura esperada: ${expectedSignature}`);
  console.log(`Assinatura recebida:   ${hash}`);

  try {
    const isValid = crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedSignature));
    console.log(isValid ? '✅ Validação da assinatura bem-sucedida!' : '❌ ERRO: As assinaturas não coincidem.');
    return isValid;
  } catch (e) {
    console.error('❌ Erro durante a comparação das assinaturas:', e);
    return false;
  }
};

export async function POST(request: Request) {
  // Verificação inicial das variáveis de ambiente
  if (!process.env.MERCADO_PAGO_ACCESS_TOKEN || !process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
    console.error('❌ ERRO CRÍTICO: Variáveis de ambiente do Mercado Pago não configuradas no servidor.');
    return NextResponse.json({ status: 'error', message: 'Configuração do servidor incompleta.' }, { status: 500 });
  }

  const requestBody = await request.text();

  if (!validateSignature(request, requestBody)) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
  }

  try {
    const body = JSON.parse(requestBody);
    console.log('🔔 Webhook do Mercado Pago recebido e validado:', body);

    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id;
      const client = getClient();
      const payment = new Payment(client);

      console.log(`🔍 A buscar detalhes do pagamento com ID: ${paymentId}`);
      const paymentInfo = await payment.get({ id: paymentId });
      console.log('✅ Detalhes do pagamento obtidos:', paymentInfo);

      if (paymentInfo && paymentInfo.external_reference) {
        const orderId = paymentInfo.external_reference;
        const status = paymentInfo.status as 'approved' | 'pending' | 'rejected' | 'refunded';

        let newOrderStatus: Order['status'] = 'pendente';
        let newPaymentStatus: Order['paymentStatus'] = 'pending';

        switch (status) {
          case 'approved':
            newOrderStatus = 'pago';
            newPaymentStatus = 'paid';
            break;
          case 'rejected':
            newOrderStatus = 'cancelado';
            newPaymentStatus = 'failed';
            break;
          case 'refunded':
            newOrderStatus = 'cancelado';
            newPaymentStatus = 'refunded';
            break;
        }

        console.log(`🔄 A atualizar pedido ${orderId} para status: ${newOrderStatus}`);
        await updateOrderStatus(orderId, newOrderStatus, newPaymentStatus);
        console.log(`✅ Pedido ${orderId} atualizado com sucesso!`);
      } else {
        console.warn(`⚠️ Pagamento ${paymentId} recebido sem referência externa.`);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('❌ Erro no processamento do webhook:', error.message);
    return NextResponse.json({ success: true });
  }
}
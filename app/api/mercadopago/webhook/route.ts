// app/api/mercadopago/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { updateOrderStatus } from '@/services/orders';
import type { Order } from '@/services/orders';
import crypto from 'crypto';

// Chave secreta para validar a assinatura do webhook (deve estar nas suas variáveis de ambiente)
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
  if (!WEBHOOK_SECRET) {
    console.warn('⚠️ A chave secreta do webhook não está configurada. A validação será ignorada.');
    return true; // Em desenvolvimento, podemos permitir, mas em produção isto é um risco.
  }

  const signatureHeader = request.headers.get('x-signature');
  if (!signatureHeader) return false;

  const parts = signatureHeader.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    acc[key.trim()] = value.trim();
    return acc;
  }, {} as Record<string, string>);

  const ts = parts['ts'];
  const hash = parts['v1'];

  if (!ts || !hash) return false;

  const manifest = `id:${JSON.parse(payload).data.id};request-id:${request.headers.get('x-request-id')};ts:${ts};`;

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  hmac.update(manifest);
  const expectedSignature = hmac.digest('hex');

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedSignature));
};


export async function POST(request: Request) {
  const requestBody = await request.text(); // Lê o corpo como texto para a validação

  if (!validateSignature(request, requestBody)) {
    console.error('❌ Assinatura do webhook inválida!');
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
  }

  try {
    const body = JSON.parse(requestBody);
    console.log('🔔 Webhook do Mercado Pago recebido e validado:', body);

    if (body.type === 'payment' && body.data?.id) {
      const paymentId = body.data.id;
      const client = getClient();
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: paymentId });

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
      }
    }

    // Responde sempre com 200 OK para confirmar o recebimento ao Mercado Pago
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('❌ Erro no processamento do webhook:', error.message);
    // Mesmo em caso de erro, responde com sucesso para evitar que o MP reenvie a notificação.
    // Os erros devem ser monitorizados pelos logs do servidor.
    return NextResponse.json({ success: true });
  }
}
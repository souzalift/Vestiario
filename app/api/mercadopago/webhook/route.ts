// app/api/mercadopago/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Payment, MercadoPagoConfig } from 'mercadopago';
import crypto from 'crypto';
import type { Order } from '@/services/orders.admin';
import { db } from '@/lib/firebaseAdmin'; // ✅ usa o que você acabou de configurar
import admin from 'firebase-admin'; // se precisar do Timestamp

// Inicializa Admin SDK (somente se ainda não estiver inicializado)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Chave secreta para validar a assinatura do webhook
const WEBHOOK_SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

const getClient = () => {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('Chave de acesso do Mercado Pago não configurada.');
  }
  return new MercadoPagoConfig({ accessToken });
};

// Validação da assinatura do webhook
const validateSignature = (request: Request, payload: string) => {
  if (!WEBHOOK_SECRET) return true; // Ignorar em dev (não faça em produção)

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

  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
};

// Atualiza pedido usando Admin SDK (ignora regras)
const updateOrderStatusAdmin = async (
  orderId: string,
  status: Order['status'],
  paymentStatus?: Order['paymentStatus']
) => {
  const docRef = db.doc(`orders/${orderId}`);
  await docRef.update({
    status,
    paymentStatus,
    updatedAt: admin.firestore.Timestamp.now(),
  });
};

export async function POST(request: NextRequest) {
  if (!process.env.MERCADO_PAGO_ACCESS_TOKEN || !process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
    return NextResponse.json({ status: 'error', message: 'Configuração incompleta do servidor.' }, { status: 500 });
  }

  const requestBody = await request.text();

  if (!validateSignature(request, requestBody)) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
  }

  try {
    const body = JSON.parse(requestBody);

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

        await updateOrderStatusAdmin(orderId, newOrderStatus, newPaymentStatus);
        console.log(`✅ Pedido ${orderId} atualizado para ${newOrderStatus}`);
      } else {
        console.warn(`⚠️ Pagamento ${paymentId} sem referência externa.`);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('❌ Erro no processamento do webhook:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// app/api/orders/[orderId]/repay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { OrderItem, Order } from '@/services/orders';

// Inicializa Admin SDK se ainda não inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Inicializa Mercado Pago
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } },
) {
  try {
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json({ error: 'ID do pedido é obrigatório.' }, { status: 400 });
    }

    // Busca o pedido direto no Firestore via Admin SDK
    const docRef = db.collection('orders').doc(orderId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    const order = docSnap.data();

    // Garante que 'order' está definido antes de acessar suas propriedades
    if (!order || order.status !== 'pendente') {
      return NextResponse.json({ error: 'Este pedido não pode ser pago novamente.' }, { status: 400 });
    }

    // Verifica items e customer
    if (!order.items || order.items.length === 0) {
      return NextResponse.json({ error: 'Pedido não possui itens.' }, { status: 400 });
    }

    if (!order.customer) {
      return NextResponse.json({ error: 'Dados do cliente estão incompletos.' }, { status: 400 });
    }

    const address = order.address || {
      zipCode: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
    };

    // Prepara itens para Mercado Pago
    const preferenceItems = order.items.map((item: OrderItem) => ({
      id: item.id,
      title: item.title,
      description: `Tamanho: ${item.size}${item.customization?.name ? `, Nome: ${item.customization.name}` : ''
        }${item.customization?.number ? `, Nº: ${item.customization.number}` : ''}`,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: 'BRL',
      picture_url: item.image || '',
    }));

    if (order.shippingPrice && order.shippingPrice > 0) {
      preferenceItems.push({
        id: 'shipping',
        title: 'Custo de Envio',
        description: 'Frete para o seu endereço',
        quantity: 1,
        unit_price: Number(order.shippingPrice),
        currency_id: 'BRL',
        picture_url: '',
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const preferenceBody = {
      items: preferenceItems,
      payer: {
        name: order.customer.firstName || '',
        surname: order.customer.lastName || '',
        email: order.customer.email || '',
        phone: {
          area_code: order.customer.phone?.replace(/\D/g, '').substring(0, 2) || '',
          number: order.customer.phone?.replace(/\D/g, '').substring(2) || '',
        },
        identification: {
          type: 'CPF',
          number: order.customer.document?.replace(/\D/g, '') || '',
        },
        address: {
          zip_code: address.zipCode.replace(/\D/g, '') || '',
          street_name: address.street || '',
          street_number: String(address.number || ''),
          neighborhood: address.neighborhood || '',
          city: address.city || '',
          federal_unit: address.state || '',
        },
      },
      back_urls: {
        success: `${baseUrl}/pedido/sucesso?order_id=${orderId}`,
        failure: `${baseUrl}/pedido/erro?order_id=${orderId}`,
        pending: `${baseUrl}/pedido/pendente?order_id=${orderId}`,
      },
      auto_return: 'approved',
      external_reference: orderId,
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
    };

    const preference = new Preference(mpClient);
    const result = await preference.create({ body: preferenceBody });

    // Retorna init_point + orderId
    return NextResponse.json({
      init_point: result.init_point,
      orderId,
    });
  } catch (error: any) {
    console.error('Erro ao criar nova preferência de pagamento:', error);
    if (error?.stack) console.error(error.stack);

    return NextResponse.json(
      { error: 'Não foi possível processar o repagamento.' },
      { status: 500 },
    );
  }
}

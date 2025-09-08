// app/api/orders/[orderId]/repay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getOrderById } from '@/services/orders';
import type { Order, OrderItem } from '@/services/orders';

// Inicialize o cliente do Mercado Pago
const client = new MercadoPagoConfig({
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

    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    // Só permite o repagamento de pedidos pendentes
    if (order.status !== 'pendente') {
      return NextResponse.json({ error: 'Este pedido não pode ser pago novamente.' }, { status: 400 });
    }

    // Prepara os dados para a preferência do Mercado Pago, reutilizando a lógica do checkout
    const preferenceItems = order.items.map((item: OrderItem) => ({
      id: item.id,
      title: item.title,
      description: `Tamanho: ${item.size}`,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: 'BRL',
      picture_url: item.image,
    }));

    if (order.shippingPrice > 0) {
      preferenceItems.push({
        id: 'shipping',
        title: 'Custo de Envio',
        description: 'Frete para o seu endereço',
        quantity: 1,
        unit_price: Number(order.shippingPrice),
        currency_id: 'BRL',
        picture_url: '/shipping.jpg', // imagem genérica para frete
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const preferenceBody = {
      items: preferenceItems,
      payer: {
        name: order.customer.firstName,
        surname: order.customer.lastName,
        email: order.customer.email,
        phone: {
          area_code: order.customer.phone.replace(/\D/g, '').substring(0, 2),
          number: order.customer.phone.replace(/\D/g, '').substring(2),
        },
        identification: {
          type: 'CPF',
          number: order.customer.document.replace(/\D/g, ''),
        },
      },
      back_urls: {
        success: `${baseUrl}/pedido/sucesso?order_id=${order.id}`,
        failure: `${baseUrl}/pedido/erro?order_id=${order.id}`,
        pending: `${baseUrl}/pedido/pendente?order_id=${order.id}`,
      },
      auto_return: 'approved',
      external_reference: order.id, // Usa o ID do pedido existente como referência
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
    };

    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceBody });

    return NextResponse.json({
      init_point: result.init_point,
    });

  } catch (error: any) {
    console.error('Erro ao criar nova preferência de pagamento:', error);
    return NextResponse.json({ error: 'Não foi possível processar o repagamento.' }, { status: 500 });
  }
}

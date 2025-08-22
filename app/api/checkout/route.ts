// app/api/checkout/route.ts
// Este arquivo lida com a criação do pedido no banco de dados e a geração do link de pagamento.

import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createOrder, generateOrderNumber } from '@/services/orders';
import type { Order, OrderItem, Customer, Address } from '@/services/orders';

// Inicialize o cliente do Mercado Pago com sua chave de acesso
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    // 1. Extrai os dados do corpo da requisição enviados pelo frontend
    const body = await request.json();
    const { items, customer, address, subtotal, shippingPrice, totalCustomizationFee, totalPrice, notes, userId } = body;

    // 2. Validação dos dados recebidos
    if (!items || items.length === 0 || !customer || !address || !totalPrice) {
      return NextResponse.json({ error: 'Dados do pedido incompletos.' }, { status: 400 });
    }

    // 3. Cria o pedido no seu banco de dados (Firestore) com status inicial "pendente"
    const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      orderNumber: generateOrderNumber(),
      userId, // Importante para vincular o pedido ao usuário
      items,
      customer,
      address,
      subtotal,
      shippingPrice,
      totalCustomizationFee,
      total: totalPrice,
      totalPrice,
      notes: notes || '',
      status: 'pendente',
      paymentStatus: 'pending',
    };

    // Salva o pedido no Firestore e obtém o ID gerado
    const newOrderId = await createOrder(orderData);

    // 4. Prepara os dados para a preferência de pagamento do Mercado Pago
    const preferenceItems = items.map((item: OrderItem) => ({
      id: item.id,
      title: item.title,
      description: `Tamanho: ${item.size}${item.customization?.name ? `, Nome: ${item.customization.name}` : ''}${item.customization?.number ? `, Nº: ${item.customization.number}` : ''}`,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: 'BRL',
      picture_url: item.image,
    }));

    // Adiciona o custo do frete como um item separado na preferência
    if (shippingPrice > 0) {
      preferenceItems.push({
        id: 'shipping',
        title: 'Custo de Envio',
        description: 'Frete para o seu endereço',
        quantity: 1,
        unit_price: Number(shippingPrice),
        currency_id: 'BRL',
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const preferenceBody = {
      items: preferenceItems,
      payer: {
        name: customer.firstName,
        surname: customer.lastName,
        email: customer.email,
        phone: {
          area_code: customer.phone.replace(/\D/g, '').substring(0, 2),
          number: customer.phone.replace(/\D/g, '').substring(2),
        },
        identification: {
          type: 'CPF',
          number: customer.document.replace(/\D/g, ''),
        },
        // MELHORIA: Adicionado o endereço do pagador para análise de fraude
        address: {
          zip_code: address.zipCode.replace(/\D/g, ''),
          street_name: address.street,
          street_number: String(address.number),
          neighborhood: address.neighborhood,
          city: address.city,
          federal_unit: address.state,
        },
      },
      back_urls: {
        success: `${baseUrl}/pedido/sucesso?order_id=${newOrderId}`,
        failure: `${baseUrl}/pedido/erro?order_id=${newOrderId}`,
        pending: `${baseUrl}/pedido/pendente?order_id=${newOrderId}`,
      },
      auto_return: 'approved',
      external_reference: newOrderId,
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
    };

    // 5. Cria a preferência de pagamento
    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceBody });

    // 6. Retorna a URL de pagamento para o frontend redirecionar o cliente
    return NextResponse.json({
      init_point: result.init_point, // A URL de pagamento!
    });

  } catch (error: any) {
    console.error('Erro ao criar preferência de pagamento:', error);
    return NextResponse.json({ error: 'Não foi possível processar o pagamento.' }, { status: 500 });
  }
}

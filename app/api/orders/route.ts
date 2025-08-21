// app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createOrder, generateOrderNumber } from '@/services/orders';
import type { Order } from '@/services/orders';

/**
 * Lida com requisições POST para /api/orders
 * Cria um novo pedido no sistema.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Extrai os dados do corpo da requisição
    const body = await request.json();
    const { items, customer, address, subtotal, shippingPrice, totalCustomizationFee, totalPrice, notes } = body;

    // 2. Validação dos dados recebidos
    // Garante que as informações essenciais para criar um pedido estão presentes.
    if (!items || !customer || !address || !totalPrice) {
      return NextResponse.json(
        { error: 'Dados do pedido incompletos. Faltam itens, informações do cliente ou endereço.' },
        { status: 400 } // Bad Request
      );
    }

    // 3. Prepara os dados do pedido para salvar no banco de dados
    const orderData: Omit<Order, 'id'> = {
      orderNumber: generateOrderNumber(),
      items,
      customer,
      address,
      subtotal,
      shippingPrice,
      totalCustomizationFee,
      total: totalPrice, // O campo 'total' na Order deve ser o preço final
      totalPrice,
      notes: notes || '',
      status: 'pendente', // Status inicial do pedido
      paymentStatus: 'pending',
      createdAt: (await import('firebase/firestore')).Timestamp.now(),
      updatedAt: (await import('firebase/firestore')).Timestamp.now()
    };

    // 4. Lógica de Negócio: Chama a função de serviço para criar o pedido no Firestore
    const newOrderId = await createOrder(orderData);

    // 5. Retorna uma resposta de sucesso com o pedido completo
    const newOrder = {
      id: newOrderId,
      ...orderData,
    };

    return NextResponse.json(
      {
        message: 'Pedido criado com sucesso!',
        order: newOrder,
      },
      { status: 201 } // 201 Created
    );

  } catch (error: any) {
    console.error('Erro ao criar o pedido:', error);
    // Retorna uma resposta de erro genérica se algo der errado no servidor
    return NextResponse.json(
      { error: 'Não foi possível processar o pedido. Tente novamente mais tarde.' },
      { status: 500 } // Internal Server Error
    );
  }
}

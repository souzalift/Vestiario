// app/api/track/[orderNumber]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getOrderByNumber } from '@/services/orders'; // Precisaremos criar esta função

type RouteContext = {
  params: {
    orderNumber: string;
  };
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orderNumber } = context.params;

    if (!orderNumber) {
      return NextResponse.json({ error: 'Número do pedido não fornecido.' }, { status: 400 });
    }

    const order = await getOrderByNumber(orderNumber);

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error(`Erro ao buscar o pedido ${context.params.orderNumber}:`, error);
    return NextResponse.json({ error: 'Erro interno ao buscar o pedido.' }, { status: 500 });
  }
}

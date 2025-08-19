import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/services/orders';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar pedido.' },
      { status: 500 }
    );
  }
}
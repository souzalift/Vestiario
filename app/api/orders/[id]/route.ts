import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/services/orders';


type Params = {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  // 👇 CORREÇÃO AQUI: 'params' não é uma Promise
  context: { params: { id: string } }
) {
  try {
    // 👇 CORREÇÃO AQUI: Removido o 'await'
    const { id } = context.params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar pedido.' },
      { status: 500 }
    );
  }
}
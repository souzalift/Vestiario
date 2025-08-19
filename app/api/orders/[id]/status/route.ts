import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '@/services/orders';

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status é obrigatório.' }, { status: 400 });
    }

    await updateOrderStatus(id, status);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar status do pedido.' },
      { status: 500 }
    );
  }
}
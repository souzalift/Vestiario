import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyAdmin } from '@/lib/admin-auth'; // Mudança aqui

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin(); // Mudança aqui

    const { id } = await params;

    await connectToDatabase();

    const order = await Order.findOne({
      $or: [
        { _id: id },
        { orderNumber: id }
      ]
    }).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order
    });

  } catch (error: any) {
    console.error('Erro ao buscar pedido:', error);

    if (error.message.includes('não autenticado') || error.message.includes('Acesso negado')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: 'UNAUTHORIZED'
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin(); // Mudança aqui

    const { id } = await params;
    const body = await request.json();

    const { orderStatus, paymentStatus, trackingCode, notes } = body;

    await connectToDatabase();

    const updateData: any = {};

    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingCode !== undefined) updateData.trackingCode = trackingCode;
    if (notes !== undefined) updateData.notes = notes;

    const order = await Order.findOneAndUpdate(
      {
        $or: [
          { _id: id },
          { orderNumber: id }
        ]
      },
      updateData,
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
      message: 'Pedido atualizado com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao atualizar pedido:', error);

    if (error.message.includes('não autenticado') || error.message.includes('Acesso negado')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: 'UNAUTHORIZED'
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { Types } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Aguardar params antes de usar
    const { id } = await params;

    console.log('🔍 Buscando pedido:', id);

    // Verificar autenticação
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ Usuário não autenticado');
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Verificar se é um ObjectId válido ou orderNumber
    const isValidObjectId = Types.ObjectId.isValid(id) && id.length === 24;

    let order: any = null;
    if (isValidObjectId) {
      // Se for um ObjectId válido, buscar por _id OU orderNumber
      order = await Order.findOne({
        $or: [
          { _id: id },
          { orderNumber: id }
        ],
        'customerInfo.clerkId': userId
      }).lean();
    } else {
      // Se não for ObjectId válido, buscar apenas por orderNumber
      order = await Order.findOne({
        orderNumber: id,
        'customerInfo.clerkId': userId
      }).lean();
    }

    console.log('📦 Pedido encontrado:', !!order);

    if (!order || Array.isArray(order)) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // Formatar dados do pedido
    const orderData = {
      orderNumber: order.orderNumber,
      items: order.items,
      total: order.total,
      subtotal: order.subtotal,
      shipping: order.shipping,
      customerInfo: order.customerInfo,
      shippingAddress: order.shippingAddress,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      trackingCode: order.trackingCode,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    return NextResponse.json({
      success: true,
      order: orderData
    });

  } catch (error: any) {
    console.error('Erro ao buscar pedido:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Aguardar params antes de usar
    const { id } = await params;

    console.log('📝 Atualizando pedido:', id);

    // Verificar autenticação
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderStatus, paymentStatus, trackingCode, notes } = body;

    await connectToDatabase();

    // Buscar e atualizar pedido (apenas por orderNumber para segurança)
    const order = await Order.findOneAndUpdate(
      {
        orderNumber: id,
        'customerInfo.clerkId': userId
      },
      {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
        ...(trackingCode && { trackingCode }),
        ...(notes && { notes }),
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Pedido atualizado:', order.orderNumber);

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        trackingCode: order.trackingCode,
        updatedAt: order.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Erro ao atualizar pedido:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
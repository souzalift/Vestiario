import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    // Aguardar params antes de usar
    const { orderNumber } = await params;

    console.log('🔍 Buscando pedido público:', orderNumber);

    await connectToDatabase();

    // Buscar pedido apenas por orderNumber (sem verificação de usuário)
    const order = await Order.findOne({
      orderNumber: orderNumber
    }).lean() as any;

    console.log('📦 Pedido público encontrado:', !!order);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // Retornar apenas dados básicos (sem informações sensíveis)
    const orderData = {
      orderNumber: order.orderNumber,
      items: order.items,
      total: order.total,
      subtotal: order.subtotal,
      shipping: order.shipping,
      customerInfo: {
        name: order.customerInfo.name,
        email: order.customerInfo.email,
        phone: order.customerInfo.phone
        // Não retornar clerkId ou document
      },
      shippingAddress: order.shippingAddress,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt
    };

    return NextResponse.json({
      success: true,
      order: orderData
    });

  } catch (error: any) {
    console.error('Erro ao buscar pedido público:', error);

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
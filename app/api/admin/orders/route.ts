import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyAdmin } from '@/lib/admin-auth'; // Mudança aqui

export async function GET(request: NextRequest) {
  try {
    // Verificar se é admin (sem redirect)
    await verifyAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await connectToDatabase();

    // Construir filtros
    const filters: any = {};

    if (status && status !== 'all') {
      filters.orderStatus = status;
    }

    if (search) {
      filters.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    // Buscar pedidos com paginação
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filters)
    ]);

    // Calcular estatísticas
    const [totalOrders, totalRevenue, statusCounts] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'approved' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ])
    ]);

    const stats = {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      statusBreakdown: statusCounts.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error: any) {
    console.error('Erro ao buscar pedidos:', error);

    // Retornar erro específico para problema de autenticação
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
      {
        success: false,
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
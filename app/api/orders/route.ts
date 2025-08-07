import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    // Usar auth() corretamente com await
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Construir filtro baseado no userId do Clerk
    let filter: any = {
      'customerInfo.clerkId': userId
    };

    // Filtrar por status se especificado
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }

    // Filtrar por busca se especificado
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'items.title': { $regex: search, $options: 'i' } }
      ];
    }

    // Buscar pedidos com paginação
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Contar total de pedidos para paginação
    const total = await Order.countDocuments(filter);

    // Calcular estatísticas
    const stats = await Order.aggregate([
      { $match: { 'customerInfo.clerkId': userId } },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsMap = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total: total,
        delivered: statsMap.delivered || 0,
        shipped: statsMap.shipped || 0,
        processing: statsMap.processing || 0,
        pending: statsMap.pending || 0,
        cancelled: statsMap.cancelled || 0
      }
    });

  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
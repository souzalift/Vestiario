import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectToDatabase();

    // Buscar estatísticas do usuário
    const [orderStats] = await Order.aggregate([
      { $match: { 'customerInfo.clerkId': userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          firstOrder: { $min: '$createdAt' }
        }
      }
    ]);

    // Buscar número de favoritos (assumindo que você tenha uma coleção de favoritos)
    // Por enquanto, vamos simular
    const favoriteProducts = 0; // Implementar quando tiver a funcionalidade de favoritos

    const stats = {
      totalOrders: orderStats?.totalOrders || 0,
      totalSpent: orderStats?.totalSpent || 0,
      favoriteProducts,
      memberSince: orderStats?.firstOrder || new Date().toISOString()
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Erro ao buscar estatísticas do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
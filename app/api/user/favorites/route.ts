import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
// import Favorite from '@/models/Favorite'; // Quando você criar o modelo

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectToDatabase();

    // Por enquanto, retornando array vazio
    // Quando você implementar favoritos, descomente e ajuste:
    /*
    const favorites = await Favorite.find({ userId })
      .populate('productId')
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
    */

    const favorites: any[] = [];

    return NextResponse.json({ favorites });

  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
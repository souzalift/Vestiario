import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import UserProfile from '@/models/UserProfile';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await connectToDatabase();

    const userProfile = await UserProfile.findOne({ clerkId: userId });

    return NextResponse.json({
      address: userProfile?.address || null
    });

  } catch (error) {
    console.error('Erro ao buscar endereço:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { address } = await request.json();

    await connectToDatabase();

    const userProfile = await UserProfile.findOneAndUpdate(
      { clerkId: userId },
      {
        clerkId: userId,
        address,
        updatedAt: new Date()
      },
      {
        upsert: true,
        new: true
      }
    );

    return NextResponse.json({
      message: 'Endereço salvo com sucesso',
      address: userProfile.address
    });

  } catch (error) {
    console.error('Erro ao salvar endereço:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
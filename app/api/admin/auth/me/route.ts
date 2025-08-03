import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { connectToDatabase } from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const token = request.headers.get('cookie')
      ?.split('; ')
      .find(row => row.startsWith('admin-token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token não encontrado' },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, secret);

    // Verificar se usuário ainda existe e está ativo
    const user = await AdminUser.findById(payload.id)
      .select('-password')
      .lean();

    // Type assertion for TypeScript
    const typedUser = user as (typeof user & { isActive?: boolean, _id: any, email: string, name: string, role: string, permissions?: string[], lastLogin?: Date });
    if (!typedUser || !typedUser.isActive) {
      return NextResponse.json(
        { success: false, error: 'Usuário inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: typedUser._id.toString(),
        email: typedUser.email,
        name: typedUser.name,
        role: typedUser.role,
        permissions: typedUser.permissions || [],
        lastLogin: typedUser.lastLogin,
      },
    });

  } catch (error) {
    console.error('Erro na verificação do token:', error);
    return NextResponse.json(
      { success: false, error: 'Token inválido' },
      { status: 401 }
    );
  }
}
import { NextResponse } from 'next/server';
import * as admin from '@/lib/firebaseAdmin';

export async function GET() {
  try {
    const listUsers = await admin.auth.listUsers();
    const users = listUsers.users.map((u) => ({
      uid: u.uid,
      email: u.email || '',
      displayName: u.displayName || '',
      photoURL: u.photoURL || '',
      role: (u.customClaims?.role as 'user' | 'admin') || 'user',
      emailVerified: u.emailVerified,
      createdAt: u.metadata.creationTime
        ? new Date(u.metadata.creationTime).toISOString()
        : null,
      lastLoginAt: u.metadata.lastSignInTime
        ? new Date(u.metadata.lastSignInTime).toISOString()
        : null,
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
  }
}

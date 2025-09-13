import { NextResponse } from 'next/server';
import * as admin from '@/lib/firebaseAdmin';

export async function PATCH(req: Request, { params }: { params: { uid: string } }) {
  try {
    const { uid } = params;
    const { role } = await req.json();

    await admin.auth.setCustomUserClaims(uid, { role });

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error('Erro ao atualizar role:', error);
    return NextResponse.json({ error: 'Erro ao atualizar role' }, { status: 500 });
  }
}

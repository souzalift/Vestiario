// app/api/coupons/[code]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getCouponByCode } from '@/services/coupons';

type RouteContext = {
  params: {
    code: string;
  };
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { code } = context.params;

    if (!code) {
      return NextResponse.json({ error: 'Código do cupom não fornecido.' }, { status: 400 });
    }

    const coupon = await getCouponByCode(code);

    if (!coupon) {
      return NextResponse.json({ error: 'Cupom inválido ou não encontrado.' }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'Este cupom não está mais ativo.' }, { status: 400 });
    }

    // Opcional: Verificar a data de validade
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return NextResponse.json({ error: 'Este cupom expirou.' }, { status: 400 });
    }

    return NextResponse.json({ coupon });

  } catch (error: any) {
    console.error(`Erro ao verificar o cupom ${context.params.code}:`, error);
    return NextResponse.json({ error: 'Erro interno ao verificar o cupom.' }, { status: 500 });
  }
}

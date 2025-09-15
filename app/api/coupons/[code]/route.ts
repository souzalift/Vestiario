import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

type RouteContext = { params: { code: string } };

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { code } = params;
    const ref = db.collection("coupons").doc(code.toUpperCase());
    const docSnap = await ref.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 });
    }

    const couponData = docSnap.data();

    if (!couponData) {
      return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 });
    }

    const coupon = {
      id: docSnap.id,
      ...couponData,
      expiryDate: couponData.expiryDate ? couponData.expiryDate.toDate().toISOString().split('T')[0] : null,
      isActive: couponData.isActive ?? false
    };

    if (!coupon.isActive) {
      return NextResponse.json({ error: "Cupom inativo" }, { status: 400 });
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return NextResponse.json({ error: "Cupom expirado" }, { status: 400 });
    }

    return NextResponse.json({ coupon });
  } catch (error: any) {
    console.error("Erro ao buscar cupom:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { code } = params;
    const body = await req.json();
    const { type, value, expiryDate } = body;

    const ref = db.collection("coupons").doc(code.toUpperCase());
    const docSnap = await ref.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 });
    }

    // Preparar dados para atualizar
    const updateData: any = {
      type,
      value: type === 'free_shipping' ? 0 : Number(value),
      updatedAt: new Date()
    };

    if (expiryDate) {
      updateData.expiryDate = new Date(expiryDate);
    } else {
      updateData.expiryDate = null;
    }

    await ref.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao atualizar cupom:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { code } = params;
    const ref = db.collection("coupons").doc(code.toUpperCase());
    const docSnap = await ref.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 });
    }

    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao apagar cupom:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
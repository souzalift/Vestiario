import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const couponsRef = db.collection("coupons");
    const snapshot = await couponsRef.get();

    const coupons = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expiryDate: doc.data().expiryDate ? doc.data().expiryDate.toDate().toISOString().split('T')[0] : null
    }));

    return NextResponse.json(coupons);
  } catch (error: any) {
    console.error("Erro ao buscar cupons:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, type, value, expiryDate, isActive = true } = body;

    // Verificar se o cupom já existe
    const existingRef = db.collection("coupons").doc(code.toUpperCase());
    const existingDoc = await existingRef.get();

    if (existingDoc.exists) {
      return NextResponse.json({ error: "Cupom já existe" }, { status: 400 });
    }

    // Preparar dados para salvar
    const couponData: any = {
      code: code.toUpperCase(),
      type,
      value: type === 'free_shipping' ? 0 : Number(value),
      isActive,
      createdAt: new Date()
    };

    if (expiryDate) {
      couponData.expiryDate = new Date(expiryDate);
    }

    // Salvar no Firestore
    await existingRef.set(couponData);

    return NextResponse.json({
      success: true,
      coupon: {
        id: code.toUpperCase(),
        ...couponData,
        expiryDate: expiryDate || null
      }
    });
  } catch (error: any) {
    console.error("Erro ao criar cupom:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
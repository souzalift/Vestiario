import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

type RouteContext = { params: { code: string } };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { code } = params;
    const body = await req.json();
    const { isActive } = body;

    const ref = db.collection("coupons").doc(code.toUpperCase());
    const docSnap = await ref.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 });
    }

    await ref.update({
      isActive,
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao alterar status do cupom:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
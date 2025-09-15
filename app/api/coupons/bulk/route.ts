import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { codes } = body;

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({ error: "Nenhum cupom especificado" }, { status: 400 });
    }

    const batch = db.batch();
    const refs = codes.map(code => db.collection("coupons").doc(code.toUpperCase()));

    // Verificar quais cupons existem
    const snapshots = await Promise.all(refs.map(ref => ref.get()));
    const existingRefs = refs.filter((ref, index) => snapshots[index].exists);

    if (existingRefs.length === 0) {
      return NextResponse.json({ error: "Nenhum cupom encontrado" }, { status: 404 });
    }

    // Deletar em lote
    existingRefs.forEach(ref => batch.delete(ref));
    await batch.commit();

    return NextResponse.json({
      success: true,
      deletedCount: existingRefs.length
    });
  } catch (error: any) {
    console.error("Erro ao apagar cupons em lote:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
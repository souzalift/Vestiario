import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const productSlug = params.slug;

    if (!productSlug) {
      return NextResponse.json(
        { error: 'Slug do produto é obrigatório' },
        { status: 400 }
      );
    }

    // Pegar IP do usuário para evitar múltiplas views da mesma pessoa
    const userIP = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Buscar produto pelo slug
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('slug', '==', productSlug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Pegar o primeiro documento (slug deve ser único)
    const productDoc = querySnapshot.docs[0];
    const productRef = doc(db, 'products', productDoc.id);

    // Incrementar view count
    await updateDoc(productRef, {
      views: increment(1),
      lastViewed: new Date(),
      // Opcional: rastrear último IP que visualizou
      lastViewedIP: userIP
    });

    console.log(`📊 View registrada para produto ${productSlug} (${productDoc.id}) do IP ${userIP}`);

    return NextResponse.json({
      success: true,
      message: 'View registrada com sucesso',
      productId: productDoc.id,
      slug: productSlug
    });

  } catch (error) {
    console.error('❌ Erro ao registrar view:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET para obter contagem atual de views
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const productSlug = params.slug;

    if (!productSlug) {
      return NextResponse.json(
        { error: 'Slug do produto é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar produto pelo slug
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('slug', '==', productSlug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    const productDoc = querySnapshot.docs[0];
    const data = productDoc.data();

    return NextResponse.json({
      success: true,
      views: data.views || 0,
      lastViewed: data.lastViewed || null,
      productId: productDoc.id,
      slug: productSlug
    });

  } catch (error) {
    console.error('❌ Erro ao buscar views:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
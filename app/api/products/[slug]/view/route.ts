import { NextRequest, NextResponse } from 'next/server';
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Params {
  slug: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    // Aguardar params conforme NextJS 15
    const { slug } = await params;



    let productRef = null;

    // Primeiro, tentar encontrar por ID
    const directDoc = await getDoc(doc(db, 'products', slug));

    if (directDoc.exists()) {
      productRef = doc(db, 'products', slug);

    } else {
      // Se não encontrar por ID, buscar por campo slug

      const slugQuery = query(
        collection(db, 'products'),
        where('slug', '==', slug),
        limit(1)
      );

      const slugSnapshot = await getDocs(slugQuery);

      if (!slugSnapshot.empty) {
        productRef = slugSnapshot.docs[0].ref;

      }
    }

    if (!productRef) {

      return NextResponse.json(
        {
          success: false,
          error: 'Produto não encontrado'
        },
        { status: 404 }
      );
    }

    // Incrementar views
    await updateDoc(productRef, {
      views: increment(1),
      lastViewed: new Date()
    });



    return NextResponse.json({
      success: true,
      message: 'Views incrementadas'
    });

  } catch (error) {
    console.error('💥 Erro ao incrementar views:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao incrementar views',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
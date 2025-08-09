import { NextResponse } from 'next/server';
import {
  getProduct,
  getProductBySlug,
  updateProduct,
  deleteProduct
} from '@/services/products';

interface RouteParams {
  params: {
    slug: string; // Mudança aqui: slug em vez de id
  };
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { slug } = params; // Mudança aqui

    // Como é uma route [slug], sempre buscar por slug
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });

  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar produto',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { slug } = params;
    const body = await request.json();

    // Primeiro, buscar o produto pelo slug para obter o ID
    const existingProduct = await getProductBySlug(slug);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Remover campos que não devem ser atualizados
    const { id: _, createdAt, ...updateData } = body;
    updateData.updatedAt = new Date();

    await updateProduct(existingProduct.id!, updateData);

    return NextResponse.json({
      success: true,
      message: 'Produto atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao atualizar produto',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { slug } = params;

    // Primeiro, buscar o produto pelo slug para obter o ID
    const existingProduct = await getProductBySlug(slug);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    await deleteProduct(existingProduct.id!);

    return NextResponse.json({
      success: true,
      message: 'Produto excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao excluir produto',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 400 }
    );
  }
}
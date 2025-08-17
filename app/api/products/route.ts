import { NextResponse } from 'next/server';
import {
  getProducts,
  createProduct,
  ProductFilters,
  Product
} from '@/services/products';
import { QueryDocumentSnapshot } from 'firebase/firestore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parâmetros de paginação
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '20');

    // Parâmetros de filtro
    const league = searchParams.get('league');
    const team = searchParams.get('team');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sizes = searchParams.get('sizes');
    const sortBy = searchParams.get('sortBy');

    // Construir filtros
    const filters: ProductFilters = {};

    if (league && league !== 'Todos') {
      filters.league = league;
    }

    if (team && team !== 'Todos') {
      filters.team = team; // Filtro direto por time
    }

    if (search) {
      filters.search = search;
    }

    if (featured === 'true') {
      filters.featured = true;
    }

    if (minPrice) {
      filters.minPrice = parseFloat(minPrice);
    }

    if (maxPrice) {
      filters.maxPrice = parseFloat(maxPrice);
    }

    if (sizes) {
      filters.sizes = sizes.split(',');
    }

    if (sortBy) {
      filters.sortBy = sortBy as 'price_asc' | 'price_desc' | 'newest' | 'popular';
    }

    // Lógica de paginação
    let lastDoc: QueryDocumentSnapshot | undefined;
    let products: Product[] = [];
    let hasMore = true;
    let currentPage = 1;

    // Buscar produtos até chegar na página desejada
    while (currentPage <= page && hasMore) {
      const result = await getProducts(filters, perPage, lastDoc);

      if (currentPage === page) {
        products = result.products;
      }

      lastDoc = result.lastDoc;
      hasMore = result.hasMore;
      currentPage++;
    }

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        perPage,
        hasMore,
        totalItems: products.length
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validação básica
    if (!body.title || !body.price || !body.league) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: title, price, league'
        },
        { status: 400 }
      );
    }

    // Gerar slug se não fornecido
    if (!body.slug) {
      body.slug = body.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    // Definir valores padrão
    const productData: Omit<Product, 'id'> = {
      title: body.title,
      description: body.description || '',
      price: parseFloat(body.price),
      images: body.images || [],
      sizes: body.sizes || [],
      featured: body.featured || false,
      tags: body.tags || [],
      brand: body.brand || '',
      league: body.league,
      slug: body.slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Criar produto
    const productId = await createProduct(productData);

    return NextResponse.json({
      success: true,
      data: {
        id: productId,
        ...productData
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    );
  }
}

// Método PUT para atualizar produtos
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Remover campos que não devem ser atualizados
    const { id: _, createdAt, ...updateData } = body;
    updateData.updatedAt = new Date();

    const { updateProduct } = await import('@/services/products');
    await updateProduct(id, updateData);

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    );
  }
}

// Método DELETE para deletar produtos
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const { deleteProduct } = await import('@/services/products');
    await deleteProduct(id);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    );
  }
}
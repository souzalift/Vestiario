import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const { products } = await request.json();

    if (!Array.isArray(products)) {
      return NextResponse.json(
        { success: false, error: 'Esperado array de produtos' },
        { status: 400 }
      );
    }

    const generateSlug = (title: string): string => {
      return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    };

    const productsWithDefaults = products.map(product => ({
      ...product,
      slug: product.slug || generateSlug(product.title),
      sizes: product.sizes || ['P', 'M', 'G', 'GG', 'XGG'],
      categories: product.categories || [],
    }));

    const insertedProducts = await Product.insertMany(productsWithDefaults);

    return NextResponse.json({
      success: true,
      data: insertedProducts,
      message: `${insertedProducts.length} produtos criados com sucesso!`
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create products' },
      { status: 500 }
    );
  }
}
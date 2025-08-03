import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const league = searchParams.get('league');
    const team = searchParams.get('team');

    let filter = {};

    if (league) {
      filter = { league: league };
    } else if (team) {
      filter = { team: team };
    }

    console.log('Filter:', filter);

    const products = await Product.find(filter).lean();

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const product = await Product.create(body);

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 400 }
    );
  }
}

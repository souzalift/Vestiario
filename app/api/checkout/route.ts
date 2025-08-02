import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'your-access-token',
  options: { timeout: 5000 }
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, payer } = body;

    const preference = new Preference(client);

    const preferenceData = {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.customization.name || item.customization.number 
          ? `${item.title} - ${item.customization.name ? `Nome: ${item.customization.name}` : ''} ${item.customization.number ? `Número: ${item.customization.number}` : ''} - Tamanho: ${item.size}`
          : `${item.title} - Tamanho: ${item.size}`,
        unit_price: item.price,
        quantity: item.quantity,
        currency_id: 'BRL',
      })),
      payer: payer || {
        email: 'test@example.com',
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/pending`,
      },
      auto_return: 'approved' as const,
      statement_descriptor: 'O Vestiario',
    };

    const result = await preference.create({ body: preferenceData });

    return NextResponse.json({
      success: true,
      preferenceId: result.id,
      initPoint: result.init_point,
    });
  } catch (error) {
    console.error('Error creating preference:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment preference' },
      { status: 500 }
    );
  }
}
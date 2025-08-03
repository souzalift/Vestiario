import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuração do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items provided' },
        { status: 400 }
      );
    }

    // Mapear itens do carrinho para o formato do Mercado Pago
    const preferenceItems = items.map((item: any) => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      unit_price: Number(item.price),
      currency_id: 'BRL',
    }));

    const preference = new Preference(client);

    // Configuração mais simples sem auto_return
    const preferenceData = {
      items: preferenceItems,
      back_urls: {
        success: 'http://localhost:3000/pagamento/sucesso',
        failure: 'http://localhost:3000/pagamento/falha',
        pending: 'http://localhost:3000/pagamento/pendente',
      },
      external_reference: `order_${Date.now()}`,
      statement_descriptor: 'O VESTIARIO',
    };

    console.log('Creating preference with data:', JSON.stringify(preferenceData, null, 2));

    const response = await preference.create({ body: preferenceData });

    console.log('Preference created successfully:', response.id);

    return NextResponse.json({
      success: true,
      preferenceId: response.id,
      initPoint: response.init_point,
    });

  } catch (error) {
    console.error('Error creating preference:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment preference' },
      { status: 500 }
    );
  }
}
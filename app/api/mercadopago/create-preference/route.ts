//api/mercadopago/create-preference/route.ts
// Este arquivo define a rota para criar uma preferência de pagamento no Mercado Pago
import { NextResponse } from 'next/server';

// 1. Importe as configurações e a classe de Preferência do SDK
import { MercadoPagoConfig, Preference } from 'mercadopago';

// 2. Inicialize o cliente do Mercado Pago com sua chave de acesso
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    // 3. Recebe os dados do pedido que o seu frontend enviou
    const orderData = await request.json();

    // Validação básica para garantir que os itens existem
    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'O carrinho está vazio.' },
        { status: 400 },
      );
    }

    // O objeto `orderData` que você montou no frontend já está no formato
    // muito próximo do que a API do Mercado Pago espera.
    // Vamos apenas garantir que os nomes das propriedades estão corretos.

    // Defina baseUrl a partir da variável de ambiente
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const preferenceBody = {
      items: orderData.items.map((item: any) => ({
        id: item.id, // Opcional, mas bom para referência
        title: item.title,
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        currency_id: 'BRL',
        picture_url: item.picture_url,
      })),
      payer: {
        name: orderData.payer.name,
        surname: orderData.payer.surname,
        email: orderData.payer.email,
        phone: {
          // A API do MP espera area_code e number separados
          // Se seu `phone` for "(11) 99999-9999", isso irá extrair o DDD e o número
          area_code: orderData.payer.phone.replace(/\D/g, '').substring(0, 2),
          number: orderData.payer.phone.replace(/\D/g, '').substring(2),
        },
        identification: {
          type: orderData.payer.identification.type, // 'CPF'
          number: orderData.payer.identification.number.replace(/\D/g, ''), // Envia apenas números
        },
        address: {
          zip_code: orderData.payer.address.zip_code.replace(/\D/g, ''),
          street_name: orderData.payer.address.street_name,
          street_number: orderData.payer.address.street_number,
          neighborhood: orderData.payer.address.neighborhood,
          city: orderData.payer.address.city,
          federal_unit: orderData.payer.address.state,
        },
      },
      back_urls: {
        success: `${baseUrl}/pedido/sucesso`,
        failure: `${baseUrl}/pedido/erro`,
        pending: `${baseUrl}/pedido/pendente`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhook` // Opcional: Para receber webhooks
    };

    // 4. Cria a instância da Preferência
    const preference = new Preference(client);

    // 5. Cria a preferência de pagamento com os dados do corpo
    const result = await preference.create({ body: preferenceBody });

    // 6. Retorna a resposta com sucesso, incluindo o ID da preferência e o init_point
    return NextResponse.json({
      success: true,
      preferenceId: result.id,
      init_point: result.init_point, // A URL de pagamento!
    });

  } catch (error: any) {
    // 7. Em caso de erro, retorna uma mensagem clara
    console.error('Erro ao criar preferência:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          'Ocorreu um erro ao processar o pagamento. Tente novamente.',
      },
      { status: 500 },
    );
  }
}
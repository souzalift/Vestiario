import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    console.log('🔄 Iniciando checkout...');

    const body = await request.json();
    console.log('📦 Dados recebidos:', JSON.stringify(body, null, 2));

    const { items, payer, shippingAddress } = body;

    // Validar dados obrigatórios
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('❌ Itens inválidos');
      return NextResponse.json(
        { success: false, error: 'Itens do carrinho são obrigatórios' },
        { status: 400 }
      );
    }

    if (!payer || !payer.email || !payer.name) {
      console.log('❌ Dados do pagador inválidos');
      return NextResponse.json(
        { success: false, error: 'Dados do comprador são obrigatórios' },
        { status: 400 }
      );
    }

    // Preparar itens para o Mercado Pago
    const preferenceItems = items.map((item: any, index: number) => ({
      id: item.id || `item_${index}`,
      title: item.title || 'Produto',
      description: `Tamanho: ${item.size}${item.customization?.name ? ` - Nome: ${item.customization.name}` : ''
        }${item.customization?.number ? ` - Número: ${item.customization.number}` : ''
        }`,
      category_id: 'fashion',
      quantity: parseInt(item.quantity) || 1,
      currency_id: 'BRL',
      unit_price: parseFloat(item.price) || 0,
    }));

    console.log('🛍️ Itens processados:', preferenceItems);

    // Preparar dados do pagador (simplificado)
    const payerData: any = {
      name: payer.name,
      surname: payer.surname || 'Sobrenome',
      email: payer.email,
    };

    // Adicionar documento se fornecido
    if (payer.document) {
      const documentClean = payer.document.replace(/\D/g, '');
      if (documentClean.length === 11) {
        payerData.identification = {
          type: 'CPF',
          number: documentClean,
        };
      }
    }

    console.log('👤 Dados do pagador:', payerData);

    // URLs de retorno - CORRIGIDO
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Criar preferência - SIMPLIFICADO
    const preference = new Preference(client);

    const preferenceData = {
      items: preferenceItems,
      payer: payerData,
      back_urls: {
        success: `${baseUrl}/pagamento/sucesso`,
        failure: `${baseUrl}/pagamento/erro`,
        pending: `${baseUrl}/pagamento/pendente`,
      },
      // REMOVER auto_return temporariamente para testar
      // auto_return: 'approved' as const,
      payment_methods: {
        installments: 12,
      },
      statement_descriptor: 'O VESTIARIO',
      external_reference: `ORDER_${Date.now()}`,
    };

    console.log('⚙️ Criando preferência com dados:', JSON.stringify(preferenceData, null, 2));

    const result = await preference.create({ body: preferenceData });

    console.log('✅ Preferência criada:', {
      id: result.id,
      init_point: result.init_point
    });

    return NextResponse.json({
      success: true,
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    });

  } catch (error) {
    console.error('❌ Erro detalhado no checkout:', error);

    // Log mais detalhado do erro
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configurar Mercado Pago - verificar se o token existe
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
if (!accessToken) {
  console.warn('⚠️ Token do Mercado Pago não configurado');
}

const client = accessToken ? new MercadoPagoConfig({
  accessToken: accessToken,
  options: { timeout: 5000 }
}) : null;

const preference = client ? new Preference(client) : null;

// Gerar número único do pedido
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `OV${timestamp.slice(-8)}${random}`;
};

// Validar email
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar telefone
const isValidPhone = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

// Validar CPF
const isValidCPF = (cpf: string) => {
  if (!cpf) return false;

  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;

  // Verificar sequência repetida
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  // Validar dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(10))) return false;

  return true;
};

// Formatar telefone para Mercado Pago
const formatPhoneForMP = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length === 11) {
    return {
      area_code: cleanPhone.slice(0, 2),
      number: cleanPhone.slice(2)
    };
  } else if (cleanPhone.length === 10) {
    return {
      area_code: cleanPhone.slice(0, 2),
      number: cleanPhone.slice(2)
    };
  }

  // Fallback - usar um número padrão válido
  return {
    area_code: "11",
    number: "999999999"
  };
};

// Validar e formatar CPF
const formatCPF = (cpf: string) => {
  if (!cpf) return null;
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length === 11) {
    return cleanCPF;
  }
  return null;
};

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando checkout...');

    const body = await request.json();
    console.log('📦 Dados recebidos:', JSON.stringify(body, null, 2));

    const { items, customerInfo, shippingAddress, totals } = body;

    // Validações básicas
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('❌ Itens inválidos');
      return NextResponse.json(
        { success: false, error: 'Itens do carrinho são obrigatórios' },
        { status: 400 }
      );
    }

    if (!customerInfo?.name || !customerInfo?.email) {
      console.log('❌ Informações do cliente incompletas');
      return NextResponse.json(
        { success: false, error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    if (!isValidEmail(customerInfo.email)) {
      console.log('❌ Email inválido:', customerInfo.email);
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    if (!customerInfo.phone || !isValidPhone(customerInfo.phone)) {
      console.log('❌ Telefone inválido:', customerInfo.phone);
      return NextResponse.json(
        { success: false, error: 'Telefone inválido' },
        { status: 400 }
      );
    }

    // Validar CPF obrigatório
    if (!customerInfo.document || !isValidCPF(customerInfo.document)) {
      console.log('❌ CPF inválido ou não informado:', customerInfo.document);
      return NextResponse.json(
        { success: false, error: 'CPF válido é obrigatório' },
        { status: 400 }
      );
    }

    if (!shippingAddress?.zipCode || !shippingAddress?.street ||
      !shippingAddress?.number || !shippingAddress?.city || !shippingAddress?.state) {
      console.log('❌ Endereço incompleto');
      return NextResponse.json(
        { success: false, error: 'Endereço completo é obrigatório' },
        { status: 400 }
      );
    }

    // Conectar ao banco
    await connectToDatabase();

    // Gerar número do pedido
    const orderNumber = generateOrderNumber();
    console.log('📝 Número do pedido gerado:', orderNumber);

    // Preparar dados do pagador com validações
    const phoneData = formatPhoneForMP(customerInfo.phone);
    const cpfFormatted = formatCPF(customerInfo.document);

    // Nome deve ter pelo menos nome e sobrenome
    const nameParts = customerInfo.name.trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'O Vestiario';

    console.log('👤 Dados do pagador processados:', {
      name: customerInfo.name,
      firstName,
      lastName,
      email: customerInfo.email,
      phone: phoneData,
      cpf: cpfFormatted
    });

    // Preparar itens para o Mercado Pago
    const mpItems = items.map((item: any) => {
      let title = item.title;

      // Adicionar customização ao título se existir
      if (item.customization?.name || item.customization?.number) {
        const customDetails = [];
        if (item.customization.name) customDetails.push(`Nome: ${item.customization.name}`);
        if (item.customization.number) customDetails.push(`Nº: ${item.customization.number}`);
        title += ` (${customDetails.join(', ')})`;
      }

      return {
        id: item.id,
        title: title,
        description: `${item.title} - Tamanho: ${item.size}`,
        picture_url: item.image,
        category_id: 'sports',
        quantity: item.quantity,
        currency_id: 'BRL',
        unit_price: item.price
      };
    });

    console.log('🛍️ Itens processados para MP:', mpItems.length);

    // Criar preferência no Mercado Pago (apenas se token configurado)
    let mpResponse = null;

    if (preference && accessToken) {
      // URLs de retorno com protocolo e domínio completos
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

      // Garantir que as URLs estejam com protocolo
      const normalizeUrl = (url: string) => {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return `http://${url}`;
        }
        return url;
      };

      const normalizedBaseUrl = normalizeUrl(baseUrl);

      const preferenceData = {
        items: mpItems,
        payer: {
          name: firstName,
          surname: lastName,
          email: customerInfo.email,
          phone: phoneData,
          identification: {
            type: 'CPF',
            number: cpfFormatted!
          },
          address: {
            street_name: shippingAddress.street,
            street_number: shippingAddress.number ? String(shippingAddress.number) : "1",
            zip_code: shippingAddress.zipCode.replace(/\D/g, '')
          }
        },
        shipments: {
          cost: totals.shipping,
          mode: 'not_specified',
          receiver_address: {
            zip_code: shippingAddress.zipCode.replace(/\D/g, ''),
            street_name: shippingAddress.street,
            street_number: shippingAddress.number ? String(shippingAddress.number) : "1",
            floor: shippingAddress.complement || '',
            apartment: shippingAddress.complement || '',
            city_name: shippingAddress.city,
            state_name: shippingAddress.state,
            country_name: 'Brasil'
          }
        },
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12
        },
        back_urls: {
          success: `${normalizedBaseUrl}/pedido/sucesso?order=${orderNumber}`,
          failure: `${normalizedBaseUrl}/pedido/erro?order=${orderNumber}`,
          pending: `${normalizedBaseUrl}/pedido/pendente?order=${orderNumber}`
        },
        // Remover auto_return completamente para evitar erros
        // auto_return: removido
        external_reference: orderNumber,
        notification_url: `${normalizedBaseUrl}/api/webhooks/mercadopago`,
        statement_descriptor: 'O VESTIARIO',
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        metadata: {
          order_number: orderNumber,
          customer_id: customerInfo.clerkId || 'guest'
        }
      };

      console.log('💳 Criando preferência no Mercado Pago...');
      console.log('🔗 URLs configuradas:', {
        baseUrl: normalizedBaseUrl,
        success: preferenceData.back_urls.success,
        failure: preferenceData.back_urls.failure,
        pending: preferenceData.back_urls.pending,
        notification: preferenceData.notification_url
      });

      try {
        mpResponse = await preference.create({ body: preferenceData });
        console.log('✅ Preferência criada:', mpResponse.id);
      } catch (mpError: any) {
        console.error('❌ Erro do Mercado Pago:', mpError);
        console.error('Details:', mpError.response?.data || mpError.message);

        // Log do token para debug (apenas primeiros caracteres)
        if (accessToken) {
          console.log('🔑 Token status:', accessToken.substring(0, 10) + '...');
        }

        // Continuar sem MP
        mpResponse = null;
      }
    } else {
      console.log('⚠️ Mercado Pago não configurado - criando pedido sem pagamento');
    }

    // Salvar pedido no banco
    console.log('💾 Salvando pedido no banco...');

    const orderData = {
      orderNumber,
      customerInfo: {
        clerkId: customerInfo.clerkId || null,
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        document: customerInfo.document // Agora sempre terá valor válido
      },
      shippingAddress: {
        street: shippingAddress.street,
        number: shippingAddress.number,
        complement: shippingAddress.complement || '',
        neighborhood: shippingAddress.neighborhood,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode
      },
      items: items.map((item: any) => ({
        productId: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        image: item.image,
        customization: item.customization || {}
      })),
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
      paymentMethod: 'mercado_pago',
      paymentStatus: 'pending',
      orderStatus: 'pending'
    };

    const order = new Order(orderData);
    await order.save();

    console.log('✅ Pedido salvo:', orderNumber);

    // Resposta de sucesso
    if (mpResponse?.init_point) {
      return NextResponse.json({
        success: true,
        orderNumber,
        preferenceId: mpResponse.id,
        initPoint: mpResponse.init_point,
        sandboxInitPoint: mpResponse.sandbox_init_point
      });
    } else {
      // Se MP não configurado ou falhou, redirecionar para página de sucesso
      return NextResponse.json({
        success: true,
        orderNumber,
        message: 'Pedido criado com sucesso. Redirecionando...',
        mockPayment: !accessToken
      });
    }

  } catch (error: any) {
    console.error('❌ Erro geral no checkout:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
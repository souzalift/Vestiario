// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { CartItem } from '@/contexts/CartContext';
import type { Coupon } from '@/services/coupons';
import { generateOrderNumber } from '@/services/orders';


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();


const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      customer,
      address,
      subtotal,
      shippingPrice,
      totalCustomizationFee,
      totalPrice,
      notes,
      userId,
      appliedCoupon,
    }: {
      items: CartItem[];
      customer: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        document: string;
      };
      address: {
        zipCode: string;
        street: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
      };
      subtotal: number;
      shippingPrice: number;
      totalCustomizationFee: number;
      totalPrice: number;
      notes?: string;
      userId?: string;
      appliedCoupon?: Coupon | null;
    } = body;


    if (!items || items.length === 0 || !customer || !address || !totalPrice) {
      return NextResponse.json({ error: 'Dados do pedido incompletos.' }, { status: 400 });
    }


    let discountAmount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        discountAmount = (subtotal * appliedCoupon.value) / 100;
      } else {
        discountAmount = appliedCoupon.value;
      }
      discountAmount = Math.min(discountAmount, subtotal);
    }


    const orderData = {
      orderNumber: generateOrderNumber(),
      userId: userId || 'GUEST_USER',
      items,
      customer,
      address,
      subtotal,
      shippingPrice,
      totalCustomizationFee,
      discountAmount,
      total: totalPrice,
      notes: notes || '',
      appliedCoupon: appliedCoupon || null,
      status: 'pendente',
      paymentStatus: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('orders').add(orderData);
    const newOrderId = docRef.id;

    // Prepara itens para o Mercado Pago
    const preferenceItems = items.map((item) => ({
      id: item.id,
      title: item.title,
      description: `Tamanho: ${item.size}${item.customization?.name ? `, Nome: ${item.customization.name}` : ''}${item.customization?.number ? `, Nº: ${item.customization.number}` : ''}`,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: 'BRL',
      picture_url: item.image,
    }));

    if (shippingPrice > 0) {
      preferenceItems.push({
        id: 'shipping',
        title: 'Custo de Envio',
        description: 'Frete para o seu endereço',
        quantity: 1,
        unit_price: Number(shippingPrice),
        currency_id: 'BRL',
        picture_url: '',
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const preferenceBody = {
      items: preferenceItems,
      payer: {
        name: customer.firstName,
        surname: customer.lastName,
        email: customer.email,
        phone: {
          area_code: customer.phone.replace(/\D/g, '').substring(0, 2),
          number: customer.phone.replace(/\D/g, '').substring(2),
        },
        identification: {
          type: 'CPF',
          number: customer.document.replace(/\D/g, ''),
        },
        address: {
          zip_code: address.zipCode.replace(/\D/g, ''),
          street_name: address.street,
          street_number: String(address.number),
          neighborhood: address.neighborhood,
          city: address.city,
          federal_unit: address.state,
        },
      },
      back_urls: {
        success: `${baseUrl}/pedido/sucesso?order_id=${newOrderId}`,
        failure: `${baseUrl}/pedido/erro?order_id=${newOrderId}`,
        pending: `${baseUrl}/pedido/pendente?order_id=${newOrderId}`,
      },
      auto_return: 'approved',
      external_reference: newOrderId,
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
    };

    const preference = new Preference(mpClient);
    const result = await preference.create({ body: preferenceBody });

    return NextResponse.json({
      init_point: result.init_point,
      orderId: newOrderId,
    });

  } catch (error: any) {
    console.error('Erro ao criar checkout:', error);
    return NextResponse.json({ error: 'Não foi possível processar o checkout.' }, { status: 500 });
  }
}

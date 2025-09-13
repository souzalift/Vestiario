'use client';

import { CartItem } from '@/contexts/CartContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import PaymentButton from './PaymentButton';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { X, Tag, Truck } from 'lucide-react';

export interface OrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  totalCustomizationFee: number;
  shippingPrice: number;
  totalPrice: number;
  processingPayment: boolean;
  onPay: () => Promise<void>;
  discountAmount?: number;
  appliedCouponCode?: string;
  onRemoveCoupon?: () => void;
}

export function OrderSummary({
  cartItems,
  subtotal,
  totalCustomizationFee,
  shippingPrice,
  totalPrice,
  processingPayment,
  onPay,
  discountAmount,
  appliedCouponCode,
  onRemoveCoupon,
}: OrderSummaryProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Resumo do Pedido</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 border-b last:border-b-0 pb-2"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded overflow-hidden border bg-muted">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="48px"
                  />
                </div>
                <div>
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.quantity}x
                    {item.size && (
                      <span className="ml-2">Tam: {item.size}</span>
                    )}
                  </div>
                  {item.customization?.name && (
                    <div className="text-xs text-muted-foreground">
                      Personalização: {item.customization.name}
                      {item.customization.number &&
                        ` - ${item.customization.number}`}
                    </div>
                  )}
                </div>
              </div>
              <span className="font-semibold text-sm">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {appliedCouponCode && discountAmount && discountAmount > 0 && (
          <div className="flex justify-between items-center text-sm text-green-700 font-medium my-2 p-2 bg-green-50 rounded-md">
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Cupom "{appliedCouponCode}" aplicado
            </div>
            {onRemoveCoupon && (
              <Button
                onClick={onRemoveCoupon}
                className="p-1 rounded hover:bg-green-100"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <span className="ml-auto">-{formatPrice(discountAmount)}</span>
          </div>
        )}

        <Separator className="my-4" />

        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {totalCustomizationFee > 0 && (
          <div className="flex justify-between text-sm">
            <span>Personalização</span>
            <span>{formatPrice(totalCustomizationFee)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span>Frete</span>
          <span className="flex items-center gap-1">
            {shippingPrice === 0 ? (
              <>
                <Truck className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-600">Grátis</span>
              </>
            ) : (
              formatPrice(shippingPrice)
            )}
          </span>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
      </CardContent>

      <CardFooter>
        {' '}
        <PaymentButton onClick={onPay} />{' '}
      </CardFooter>
    </Card>
  );
}

export default OrderSummary;

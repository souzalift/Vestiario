// components/checkout/OrderSummary.tsx
import { CartItem } from '@/contexts/CartContext';

export interface OrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  totalCustomizationFee: number;
  shippingPrice: number;
  totalPrice: number;
  processingPayment: boolean;
  onPay: () => Promise<void>;
}

export function OrderSummary({
  cartItems,
  subtotal,
  totalCustomizationFee,
  shippingPrice,
  totalPrice,
  processingPayment,
  onPay,
}: OrderSummaryProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);

  return (
    <div className="border rounded p-4 space-y-4 shadow-sm">
      <h2 className="font-semibold text-lg">Resumo do Pedido</h2>

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <span>
              {item.title} x {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <hr />

      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>

      {totalCustomizationFee > 0 && (
        <div className="flex justify-between">
          <span>Personalização</span>
          <span>{formatPrice(totalCustomizationFee)}</span>
        </div>
      )}

      <div className="flex justify-between">
        <span>Frete</span>
        <span>
          {shippingPrice === 0 ? 'Grátis' : formatPrice(shippingPrice)}
        </span>
      </div>

      <hr />

      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>{formatPrice(totalPrice)}</span>
      </div>

      <button
        onClick={onPay}
        disabled={processingPayment || cartItems.length === 0}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 mt-3 rounded disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {processingPayment ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          'Pagar com Mercado Pago'
        )}
      </button>
    </div>
  );
}
export default OrderSummary;

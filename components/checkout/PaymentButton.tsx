'use client';

import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

interface PaymentButtonProps {
  onClick: () => void;
  disabled?: boolean;
  processing?: boolean;
}

export default function PaymentButton({
  onClick,
  disabled,
  processing,
}: PaymentButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || processing}
      className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 text-sm font-semibold disabled:opacity-50 flex justify-center items-center gap-2"
    >
      {processing ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          Processando...
        </>
      ) : (
        <>
          <CreditCard className="h-5 w-5" />
          Pagar com Mercado Pago
        </>
      )}
    </Button>
  );
}

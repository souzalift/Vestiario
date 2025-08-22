'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Order } from '@/services/orders';
import { toast } from 'sonner';

// UI e Ícones
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Search,
  Package,
  CheckCircle,
  Truck,
  Home,
} from 'lucide-react';
import { Separator } from '@radix-ui/react-separator';

// Esquema de validação para o formulário de busca
const trackingSchema = z.object({
  orderNumber: z
    .string()
    .min(5, 'Por favor, insira um número de pedido válido.'),
});
type TrackingFormData = z.infer<typeof trackingSchema>;

export default function RastreioPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TrackingFormData>({
    resolver: zodResolver(trackingSchema),
  });

  const handleTrackOrder = async (data: TrackingFormData) => {
    setError(null);
    setOrder(null);

    try {
      const response = await fetch(`/api/track/${data.orderNumber.trim()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Pedido não encontrado.');
      }

      setOrder(result.order);
      toast.success('Pedido encontrado!');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const statusSteps = [
    { status: 'pago', label: 'Pagamento Aprovado', icon: <CheckCircle /> },
    { status: 'enviado', label: 'Pedido Enviado', icon: <Truck /> },
    { status: 'entregue', label: 'Entregue', icon: <Home /> },
  ];

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    const index = statusSteps.findIndex((step) => step.status === order.status);
    // Se o status for "pago" ou posterior, consideramos o primeiro passo como completo.
    return index >= 0 ? index : order.status === 'pendente' ? -1 : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900">
            Rastreie o seu Pedido
          </h1>
          <p className="text-gray-600 mt-2">
            Insira o número do seu pedido (ex: V-20240101-ABCDEF) para ver o
            status.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <form
              onSubmit={handleSubmit(handleTrackOrder)}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-grow">
                <Label htmlFor="orderNumber" className="sr-only">
                  Número do Pedido
                </Label>
                <Input
                  id="orderNumber"
                  placeholder="Insira o número do pedido"
                  {...register('orderNumber')}
                  className="h-12 text-base"
                />
                {errors.orderNumber && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.orderNumber.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 text-base"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Search className="w-5 h-5 mr-2 text-white" />
                )}
                <span className="text-white">Rastrear</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {order && (
          <Card className="mt-8 animate-fade-in">
            <CardHeader>
              <CardTitle>Detalhes do Pedido #{order.orderNumber}</CardTitle>
              <p className="text-sm text-gray-500">
                Realizado em{' '}
                {format(order.createdAt, "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Status do Envio</h3>
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, index) => (
                    <div
                      key={step.status}
                      className="flex flex-col items-center text-center w-1/3 mb-5"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                          index <= currentStepIndex
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                        }`}
                      >
                        {step.icon}
                      </div>
                      <p
                        className={`mt-2 font-semibold text-sm ${
                          index <= currentStepIndex
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="relative w-full h-1 bg-gray-200 mt-[-2.5rem] -z-10">
                  <div
                    className="absolute top-0 left-0 h-1 bg-green-500 transition-all duration-500"
                    style={{
                      width: `${
                        (currentStepIndex / (statusSteps.length - 1)) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              {/* Separator entre status e cliente */}
              <Separator className="my-6" />
              <div className="border-t pt-3 text-sm">
                <p>
                  <span className="font-semibold">Cliente:</span>{' '}
                  {order.customer.firstName} {order.customer.lastName}
                </p>
                <p>
                  <span className="font-semibold">Endereço:</span>{' '}
                  {order.address.street}, {order.address.number} -{' '}
                  {order.address.city}, {order.address.state}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

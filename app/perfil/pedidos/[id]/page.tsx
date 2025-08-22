'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getOrderById, Order } from '@/services/orders';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

// UI e Ícones
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  ArrowLeft,
  Package,
  CheckCircle,
  Truck,
  Home,
  FileText,
  ShoppingCart,
  User,
  MapPin,
} from 'lucide-react';

export default function PedidoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const { userProfile, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!userProfile) {
      toast.error('Você precisa estar logado para ver seus pedidos.');
      router.push('/login');
      return;
    }

    if (orderId && userProfile.uid) {
      const fetchOrder = async () => {
        try {
          const orderData = await getOrderById(orderId);

          // Verificação de segurança: garante que o pedido pertence ao utilizador logado
          if (orderData && orderData.userId === userProfile.uid) {
            setOrder(orderData);
          } else {
            setError('Pedido não encontrado ou acesso não permitido.');
            toast.error('Pedido não encontrado ou acesso não permitido.');
          }
        } catch (err) {
          setError('Erro ao carregar o pedido.');
          toast.error('Erro ao carregar o pedido.');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [orderId, userProfile, authLoading, router]);

  const formatCurrency = (value: number = 0) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  const formatDate = (date: Date) =>
    format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const statusSteps = [
    { status: 'pago', label: 'Pagamento Aprovado', icon: <CheckCircle /> },
    { status: 'enviado', label: 'Pedido Enviado', icon: <Truck /> },
    { status: 'entregue', label: 'Entregue', icon: <Home /> },
  ];

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    const paidIndex = statusSteps.findIndex((step) => step.status === 'pago');
    const currentIndex = statusSteps.findIndex(
      (step) => step.status === order.status,
    );

    // Se o status for pago, enviado ou entregue, o passo "pago" está completo.
    if (
      order.status === 'pago' ||
      order.status === 'enviado' ||
      order.status === 'entregue'
    ) {
      return Math.max(paidIndex, currentIndex);
    }
    return -1; // Pendente ou cancelado
  };

  const currentStepIndex = getCurrentStepIndex();

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Detalhes do Pedido
            </h1>
            <p className="text-gray-600 mt-1 font-mono">{order.orderNumber}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/perfil/pedidos">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Meus Pedidos
            </Link>
          </Button>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Status do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {statusSteps.map((step, index) => (
                  <div
                    key={step.status}
                    className="flex flex-col items-center text-center w-1/3"
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
              {order.trackingCode && (
                <div className="mt-12 text-center">
                  <p className="text-sm text-gray-600">
                    Seu código de rastreio:
                  </p>
                  <p className="font-mono text-lg font-semibold bg-gray-100 inline-block px-4 py-2 rounded-md my-2">
                    {order.trackingCode}
                  </p>
                  <div>
                    <Button asChild>
                      <a
                        className="text-white"
                        href={`https://t.17track.net/pt#nums=${order.trackingCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Truck className="w-4 h-4 mr-2" /> Acompanhar Entrega
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart /> Itens do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded-md border"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
              <div className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete</span>
                  <span className="text-gray-900">
                    {formatCurrency(order.shippingPrice)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">
                    {formatCurrency(order.totalPrice)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin /> Endereço de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-gray-800">
              <p>
                {order.address.street}, {order.address.number}
                {order.address.complement
                  ? `, ${order.address.complement}`
                  : ''}
              </p>
              <p>{order.address.neighborhood}</p>
              <p>
                {order.address.city} - {order.address.state}
              </p>
              <p>CEP: {order.address.zipCode}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

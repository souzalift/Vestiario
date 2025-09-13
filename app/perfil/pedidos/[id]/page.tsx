'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Order, OrderItem } from '@/services/orders';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

// Firebase imports for real-time updates
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// UI e Ícones
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  ArrowLeft,
  Package,
  CheckCircle2,
  Truck,
  Home,
  FileText,
  ShoppingCart,
  User,
  MapPin,
  CreditCard,
  RefreshCw,
  XCircle,
} from 'lucide-react';

export default function PedidoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const { userProfile, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [repayingOrderId, setRepayingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!userProfile) {
      toast.error('Você precisa estar logado para ver seus pedidos.');
      router.push('/login');
      return;
    }

    if (orderId && userProfile.uid) {
      const orderRef = doc(db, 'orders', orderId);

      const unsubscribe = onSnapshot(
        orderRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const orderData = {
              id: docSnapshot.id,
              ...docSnapshot.data(),
              createdAt: (docSnapshot.data().createdAt as Timestamp).toDate(),
              updatedAt: (docSnapshot.data().updatedAt as Timestamp).toDate(),
            } as Order;

            // Security check: ensure the order belongs to the logged-in user
            if (orderData.userId === userProfile.uid) {
              setOrder(orderData);
            } else {
              toast.error('Acesso não permitido a este pedido.');
              router.push('/perfil/pedidos');
            }
          } else {
            toast.error('Pedido não encontrado.');
            router.push('/perfil/pedidos');
          }
          setLoading(false);
        },
        (error) => {
          console.error('Erro ao buscar pedido:', error);
          toast.error('Não foi possível carregar os detalhes do pedido.');
          setLoading(false);
        },
      );

      return () => unsubscribe();
    }
  }, [orderId, userProfile, authLoading, router]);

  const handleRepay = async (orderId: string) => {
    setRepayingOrderId(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/repay`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar link de pagamento.');
      }
      window.location.href = data.init_point;
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setRepayingOrderId(null);
    }
  };

  const handleReorder = (currentOrder: Order) => {
    currentOrder.items.forEach((item) => {
      addItem(
        {
          productId: item.id,
          productSlug: item.productSlug,
          title: item.title,
          basePrice: item.basePrice,
          image: item.image,
          team: item.team,
          category: 'default',
        },
        {
          size: item.size,
          quantity: item.quantity,
          customization: item.customization,
        },
      );
    });
    toast.success('Itens adicionados novamente ao carrinho!');
    router.push('/carrinho');
  };

  const formatCurrency = (value: number = 0) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  const formatDate = (date: Date) =>
    format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const statusSteps = [
    {
      status: 'pago',
      label: 'Pagamento Aprovado',
      icon: <CheckCircle2 size={24} />,
    },
    { status: 'enviado', label: 'Pedido Enviado', icon: <Truck size={24} /> },
    { status: 'entregue', label: 'Entregue', icon: <Home size={24} /> },
  ];

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    const currentStatusIndex = statusSteps.findIndex(
      (step) => step.status === order.status,
    );
    // Se o status for pago, enviado ou entregue, o passo 'pago' está completo.
    if (['pago', 'enviado', 'entregue'].includes(order.status)) {
      return currentStatusIndex >= 0 ? currentStatusIndex : 0; // Se for 'pago' ou superior, o passo 0 está completo
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

  if (!order) {
    return null; // ou um ecrã de erro/carregamento
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
            <CardContent className="pt-8">
              <div className="flex items-center justify-between relative">
                {statusSteps.map((step, index) => (
                  <div
                    key={step.status}
                    className="flex flex-col items-center text-center w-1/3 z-10"
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
                <div className="absolute top-6 left-0 w-full h-1 bg-gray-200">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User /> Detalhes do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-800">
                <p>
                  <strong>Nome:</strong> {order.customer.name}
                </p>
                <p>
                  <strong>Email:</strong> {order.customer.email}
                </p>
                <p>
                  <strong>CPF:</strong> {order.customer.document}
                </p>
                <p>
                  <strong>Telefone:</strong> {order.customer.phone}
                </p>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart /> Itens do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-gray-100 -mt-4">
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
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              {order.status === 'pendente' && (
                <Button
                  onClick={() => handleRepay(order.id)}
                  disabled={repayingOrderId === order.id}
                  className="w-full sm:w-auto"
                >
                  {repayingOrderId === order.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  {repayingOrderId === order.id
                    ? 'A processar...'
                    : 'Pagar Agora'}
                </Button>
              )}
              <Button
                onClick={() => handleReorder(order)}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Repetir Compra
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

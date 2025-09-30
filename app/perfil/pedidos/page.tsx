'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Order } from '@/services/orders';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';

// Firebase imports for real-time updates
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// UI e Ícones
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  Package,
  ArrowRight,
  FileText,
  Truck,
  CheckCircle2,
  XCircle,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MeusPedidosPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [repayingOrderId, setRepayingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (userProfile?.uid) {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', userProfile.uid),
        orderBy('createdAt', 'desc'),
      );

      const unsubscribe = onSnapshot(
        ordersQuery,
        (querySnapshot) => {
          const userOrders = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate
                ? data.createdAt.toDate()
                : new Date(),
              updatedAt: data.updatedAt?.toDate
                ? data.updatedAt.toDate()
                : new Date(),
            } as Order;
          });
          setOrders(userOrders);
          setLoading(false);
        },
        (error) => {
          console.error('Erro ao buscar pedidos em tempo real:', error);
          toast.error('Não foi possível carregar os seus pedidos.');
          setLoading(false);
        },
      );

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [userProfile, authLoading]);

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

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      const productData = {
        productId: item.id,
        productSlug: item.productSlug,
        title: item.title,
        basePrice: item.basePrice,
        image: item.image,
        team: item.team,
        category: 'default',
      };
      const options = {
        size: item.size,
        quantity: item.quantity,
        customization: item.customization,
      };
      addItem(productData, options);
    });
    toast.success('Itens do pedido adicionados novamente ao carrinho!');
  };

  const formatCurrency = (value: number = 0) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const formatDate = (date: Date) => {
    if (!date || !(date instanceof Date)) return 'Data indisponível';
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const statusMap: {
    [key: string]: { text: string; className: string; icon: JSX.Element };
  } = {
    pendente: {
      text: 'Pendente',
      className: 'bg-yellow-100 text-yellow-800',
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
    },
    pago: {
      text: 'Pago',
      className: 'bg-green-100 text-green-800',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    enviado: {
      text: 'Enviado',
      className: 'bg-blue-100 text-blue-800',
      icon: <Truck className="w-3 h-3" />,
    },
    entregue: {
      text: 'Entregue',
      className: 'bg-gray-100 text-gray-800',
      icon: <Package className="w-3 h-3" />,
    },
    cancelado: {
      text: 'Cancelado',
      className: 'bg-red-100 text-red-800',
      icon: <XCircle className="w-3 h-3" />,
    },
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-3 sm:py-10 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
        Meus Pedidos
      </h1>
      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold">
              Nenhum pedido encontrado
            </h3>
            <Button asChild className="mt-6 w-full sm:w-auto">
              <Link href="/">Ver produtos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = statusMap[order.status] || {
              text: order.status,
              className: 'bg-gray-100 text-gray-800',
              icon: <Package className="w-3 h-3" />,
            };
            return (
              <Card
                key={order.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 pb-4">
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold">
                      Pedido #{order.orderNumber}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Realizado em {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}
                  >
                    {statusInfo.icon} {statusInfo.text}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 sm:-space-x-4 mb-4">
                    {order.items.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="relative w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-100"
                      >
                        <Image
                          src={item.image || '/placeholder.png'}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {order.items.length > 5 && (
                      <div className="relative w-12 h-12 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-semibold">
                        +{order.items.length - 5}
                      </div>
                    )}
                  </div>

                  {order.status === 'pendente' && (
                    <div className="border-t border-b py-4 my-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <p className="text-sm font-medium text-yellow-800">
                        Seu pagamento está pendente.
                      </p>
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
                    </div>
                  )}

                  {order.trackingCode && (
                    <div className="border-t border-b py-4 my-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">
                        Rastreio
                      </h4>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <p className="font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded">
                          {order.trackingCode}
                        </p>
                        <Button asChild size="sm" className="w-full sm:w-auto">
                          <a
                            href={`https://t.17track.net/pt#nums=${order.trackingCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Truck className="w-4 h-4 mr-2" /> Rastrear Pedido
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="font-bold text-lg text-gray-900 ml-2">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button
                        onClick={() => handleReorder(order)}
                        variant="secondary"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" /> Repetir Compra
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Link href={`/perfil/pedidos/${order.id}`}>
                          Ver Detalhes <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

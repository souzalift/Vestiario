'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders, Order } from '@/services/orders';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// UI e Ícones
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, ArrowRight, FileText, Truck } from 'lucide-react';

export default function MeusPedidosPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (userProfile?.uid) {
      const fetchOrders = async () => {
        try {
          const userOrders = await getUserOrders(userProfile.uid);
          setOrders(userOrders);
        } catch (error) {
          console.error('Erro ao buscar pedidos:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [userProfile, authLoading]);

  const formatCurrency = (value: number = 0) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  const formatDate = (date: Date) =>
    format(date, 'dd/MM/yyyy', { locale: ptBR });

  const statusMap: { [key: string]: { text: string; className: string } } = {
    pendente: { text: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
    pago: { text: 'Pago', className: 'bg-green-100 text-green-800' },
    enviado: { text: 'Enviado', className: 'bg-blue-100 text-blue-800' },
    entregue: { text: 'Entregue', className: 'bg-gray-100 text-gray-800' },
    cancelado: { text: 'Cancelado', className: 'bg-red-100 text-red-800' },
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Pedidos</h1>
      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Nenhum pedido encontrado</h3>
            <Button asChild className="mt-6">
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
            };
            return (
              <Card
                key={order.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-start justify-between pb-4">
                  <div>
                    <CardTitle className="text-lg font-bold">
                      Pedido #{order.orderNumber}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Realizado em {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}
                  >
                    {statusInfo.text}
                  </span>
                </CardHeader>
                <CardContent>
                  {/* NOVO: Secção de Rastreio */}
                  {order.trackingCode && (
                    <div className="border-t border-b py-4 my-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">
                        Rastreio
                      </h4>
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded">
                          {order.trackingCode}
                        </p>
                        <Button asChild size="sm">
                          <a
                            className="text-white"
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

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="font-bold text-lg text-gray-900 ml-2">
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/perfil/pedidos/${order.id}`}>
                        Ver Detalhes <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
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

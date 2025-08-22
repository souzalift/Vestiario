// app/admin/dashboard/page.tsx

import Link from 'next/link';
import { getDashboardData, Order } from '@/services/orders';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// UI e Ícones
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Funções de formatação
const formatCurrency = (value: number = 0) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    value,
  );
const formatDate = (date: Date) => format(date, 'dd/MM/yyyy', { locale: ptBR });

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  const statusMap: { [key: string]: { text: string; className: string } } = {
    pendente: { text: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
    pago: { text: 'Pago', className: 'bg-green-100 text-green-800' },
    enviado: { text: 'Enviado', className: 'bg-blue-100 text-blue-800' },
    entregue: { text: 'Entregue', className: 'bg-gray-100 text-gray-800' },
    cancelado: { text: 'Cancelado', className: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Cartões de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Faturamento Total (Pago)
              </CardTitle>
              <DollarSign className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(data.totalRevenue)}
              </div>
              <p className="text-xs text-gray-500">
                de {data.paidOrdersCount} pedidos pagos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Pedidos
              </CardTitle>
              <Package className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalOrders}</div>
              <p className="text-xs text-gray-500">desde o início</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Ticket Médio (Pago)
              </CardTitle>
              <CreditCard className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(data.averageTicket)}
              </div>
              <p className="text-xs text-gray-500">
                valor médio por pedido pago
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Pedidos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-2 font-normal">Pedido</th>
                    <th className="pb-2 font-normal">Cliente</th>
                    <th className="pb-2 font-normal">Status</th>
                    <th className="pb-2 font-normal text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => {
                    const statusInfo = statusMap[order.status] || {
                      text: order.status,
                      className: 'bg-gray-100 text-gray-800',
                    };
                    return (
                      <tr key={order.id} className="border-t">
                        <td className="py-3 font-mono text-sm">
                          {order.orderNumber}
                        </td>
                        <td>{order.customer.name}</td>
                        <td>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}
                          >
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="text-right font-medium">
                          {formatCurrency(order.totalPrice)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <Button variant="ghost" asChild>
                <Link href="/admin/pedidos">
                  Ver todos os pedidos <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// app/admin/dashboard/page.tsx

import Link from 'next/link';
import { getDashboardData, Order } from '@/services/orders';

// UI e Ícones
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  Package,
  CreditCard,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table';

// Funções de formatação
const formatCurrency = (value: number = 0) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    value,
  );

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  // Calcular produtos mais vendidos
  const productSales: Record<string, { title: string; quantity: number }> = {};
  data.recentOrders.forEach((order: Order) => {
    order.items?.forEach((item: any) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { title: item.title, quantity: 0 };
      }
      productSales[item.productId].quantity += item.quantity;
    });
  });
  // Ordena por quantidade vendida (top 5)
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const statusMap: { [key: string]: { text: string; className: string } } = {
    pendente: { text: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
    pago: { text: 'Pago', className: 'bg-green-100 text-green-800' },
    enviado: { text: 'Enviado', className: 'bg-blue-100 text-blue-800' },
    entregue: { text: 'Entregue', className: 'bg-gray-100 text-gray-800' },
    cancelado: { text: 'Cancelado', className: 'bg-red-100 text-red-800' },
  };

  const paymentStatusMap: {
    [key: string]: { text: string; className: string };
  } = {
    pending: { text: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
    paid: { text: 'Pago', className: 'bg-green-100 text-green-800' },
    failed: { text: 'Falhou', className: 'bg-red-100 text-red-800' },
    refunded: { text: 'Reembolsado', className: 'bg-blue-100 text-blue-800' },
    canceled: { text: 'Cancelado', className: 'bg-gray-100 text-gray-800' },
  };

  return (
    <div className="pb-12">
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
            <p className="text-xs text-gray-500">valor médio por pedido pago</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid com Pedidos Recentes e Produtos Mais Vendidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pedidos Recentes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentOrders.map((order) => {
                    const statusInfo = statusMap[order.status] || {
                      text: order.status,
                      className: 'bg-gray-100 text-gray-800',
                    };
                    const paymentInfo = paymentStatusMap[
                      order.paymentStatus ?? ''
                    ] || {
                      text: order.paymentStatus || 'N/A',
                      className: 'bg-gray-100 text-gray-800',
                    };
                    const nomeCliente =
                      `${order.customer?.firstName || ''} ${
                        order.customer?.lastName || ''
                      }`.trim() ||
                      order.customer?.name ||
                      'N/A';
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>{nomeCliente}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}
                          >
                            {statusInfo.text}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${paymentInfo.className}`}
                          >
                            {paymentInfo.text}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(order.totalPrice)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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

        {/* Produtos Mais Vendidos */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-sm">Sem dados suficientes.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {topProducts.map((prod, idx) => (
                  <li
                    key={prod.title}
                    className="py-2 flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-900">
                      {idx + 1}. {prod.title}
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full font-mono">
                      {prod.quantity} vendas
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

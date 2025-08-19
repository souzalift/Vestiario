import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getAllOrders, Order } from '@/services/orders';

// Função para buscar os dados no servidor
async function getPedidos(): Promise<Order[]> {
  const rawOrders = await getAllOrders();
  // Map and ensure all required properties exist
  return rawOrders.map((order: any) => ({
    ...order,
    totalPrice: order.totalPrice ?? 0,
    shippingPrice: order.shippingPrice ?? 0,
    totalCustomizationFee: order.totalCustomizationFee ?? 0,
    notes: order.notes ?? '',
    items: order.items ?? [],
    // Add other required fields with defaults if needed
  }));
}

export default async function AdminPedidosPage() {
  const orders = await getPedidos();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const statusMap = {
    pending: { text: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
    pendente: { text: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
    approved: { text: 'Pago', className: 'bg-green-100 text-green-800' },
    pago: { text: 'Pago', className: 'bg-green-100 text-green-800' },
    enviado: { text: 'Enviado', className: 'bg-blue-100 text-blue-800' },
    entregue: { text: 'Entregue', className: 'bg-gray-100 text-gray-800' },
    cancelado: { text: 'Cancelado', className: 'bg-red-100 text-red-800' },
    // Adicione outros status se necessário
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Painel de Pedidos
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => {
                const statusInfo = statusMap[order.status] || {
                  text: order.status,
                  className: 'bg-gray-100 text-gray-800',
                };

                // Corrige datas Firestore Timestamp ou string
                let dataPedido = '-';
                if (order.createdAt) {
                  try {
                    const dateObj =
                      typeof order.createdAt === 'object' &&
                      'seconds' in order.createdAt
                        ? new Date(order.createdAt.seconds * 1000)
                        : new Date(order.createdAt);
                    dataPedido = format(dateObj, "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    });
                  } catch {
                    dataPedido = '-';
                  }
                }

                // Corrige nome do cliente
                const nomeCliente =
                  order.customer?.firstName || order.customer?.name
                    ? `${order.customer?.firstName || order.customer?.name} ${
                        order.customer?.lastName || ''
                      }`.trim()
                    : '-';

                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-800">
                      {order.orderNumber || order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dataPedido}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{nomeCliente}</div>
                      <div className="text-xs text-gray-500">
                        {order.customer?.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.className}`}
                      >
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(order.totalPrice || order.total || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver Detalhes
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

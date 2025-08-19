import { notFound } from 'next/navigation';
import { getOrderById } from '@/services/orders';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Order } from '@/services/orders';
import { StatusForm } from './_components/StatusForm'; // Importa o Client Component

function formatCurrency(value: number | undefined | null) {
  if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(
  date: Date | { seconds: number; nanoseconds: number } | string | undefined,
) {
  if (!date) return '-';
  try {
    let d: Date;
    if (typeof date === 'object' && 'seconds' in date) {
      d = new Date(date.seconds * 1000);
    } else if (typeof date === 'string') {
      d = new Date(date);
    } else {
      d = date as Date;
    }
    return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return '-';
  }
}

// Status possíveis conforme sua interface
const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'pago', label: 'Pago' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelado', label: 'Cancelado' },
];

export default async function AdminPedidoPage({ params }: { params: any }) {
  const { id } = await params;
  const order: Order | null = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">
        Pedido {order.orderNumber || order.id}
      </h1>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <span className="font-semibold text-gray-700">Data:</span>{' '}
          <span className="text-gray-900">{formatDate(order.createdAt)}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Status:</span>{' '}
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-bold ${
              order.status === 'entregue'
                ? 'bg-green-100 text-green-700'
                : order.status === 'pendente'
                ? 'bg-yellow-100 text-yellow-700'
                : order.status === 'cancelado'
                ? 'bg-red-100 text-red-700'
                : order.status === 'enviado'
                ? 'bg-blue-100 text-blue-700'
                : order.status === 'pago'
                ? 'bg-green-50 text-green-800'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          {/* Formulário de atualização de status */}
          <StatusForm orderId={order.id} currentStatus={order.status} />
        </div>
        <div>
          <span className="font-semibold text-gray-700">Total:</span>{' '}
          <span className="text-gray-900">
            {formatCurrency(order.totalPrice ?? order.total)}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Cliente</h2>
        <div className="text-gray-800 space-y-1 text-sm">
          <p>
            <span className="font-semibold text-gray-600">Nome:</span>
            {` ${order.customer?.firstName} ${order.customer?.lastName}`}
          </p>
          <p>
            <span className="font-semibold text-gray-600">Email:</span>
            {` ${order.customer?.email || '-'}`}
          </p>
          <p>
            <span className="font-semibold text-gray-600">CPF:</span>
            {` ${order.customer?.document || '-'}`}
          </p>
          <p>
            <span className="font-semibold text-gray-600">Telefone:</span>
            {` ${order.customer?.phone || '-'}`}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Endereço de Entrega</h2>
        <address className="text-gray-700 not-italic space-y-1 text-sm">
          <p>
            {order.address?.street}, {order.address?.number}
            {order.address?.complement ? `, ${order.address.complement}` : ''}
          </p>
          <p>{order.address?.neighborhood}</p>
          <p>
            {order.address?.city} - {order.address?.state}
          </p>
          <p>CEP: {order.address?.zipCode}</p>
        </address>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Itens do Pedido</h2>
        <div className="divide-y divide-gray-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 py-3">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <div className="font-medium text-gray-900">{item.title}</div>
                <div className="text-sm text-gray-600">
                  Quantidade: {item.quantity}
                  {item.size && <span> | Tamanho: {item.size}</span>}
                  {item.customization &&
                    (item.customization.name || item.customization.number) && (
                      <span>
                        {' '}
                        | Personalização: {item.customization.name}{' '}
                        {item.customization.number &&
                          `#${item.customization.number}`}
                      </span>
                    )}
                </div>
              </div>
              <div className="font-semibold text-gray-800">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Observações</h2>
        <div className="text-gray-800">{order.notes || '-'}</div>
      </div>
    </div>
  );
}

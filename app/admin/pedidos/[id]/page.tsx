import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getOrderById, Order } from '@/services/orders.admin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// UI e Ícones
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  ArrowLeft,
  Edit,
  User,
  MapPin,
  FileText,
  ShoppingCart,
} from 'lucide-react';

// Funções de formatação
function formatCurrency(value: number = 0) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(date: Date) {
  if (!date) return '-';
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export default async function AdminPedidoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const statusMap: { [key: string]: { text: string; className: string } } = {
    pendente: { text: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
    pago: { text: 'Pago', className: 'bg-green-100 text-green-800' },
    enviado: { text: 'Enviado', className: 'bg-blue-100 text-blue-800' },
    entregue: { text: 'Entregue', className: 'bg-gray-100 text-gray-800' },
    cancelado: { text: 'Cancelado', className: 'bg-red-100 text-red-800' },
  };

  const statusInfo = statusMap[order.status] || {
    text: order.status,
    className: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Detalhes do Pedido
              </h1>
              <p className="text-gray-600 mt-1 font-mono">
                {order.orderNumber}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/admin/pedidos">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Pedidos
                </Link>
              </Button>
              <Button
                asChild
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Link href={`/admin/pedidos/${order.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" /> Editar Pedido
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Resumo do Pedido */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText /> Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="font-semibold text-gray-600">Data do Pedido</p>
                  <p className="text-gray-900">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">Status</p>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}
                  >
                    {statusInfo.text}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">Total Pago</p>
                  <p className="text-gray-900 font-bold">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Dados do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User /> Dados do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-600">Nome Completo</p>
                  <p className="text-gray-900">{`${order.customer.firstName} ${order.customer.lastName}`}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">Email</p>
                  <p className="text-gray-900">{order.customer.email}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">Telefone</p>
                  <p className="text-gray-900">{order.customer.phone}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">CPF</p>
                  <p className="text-gray-900">{order.customer.document}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-600">
                    Data de Nascimento
                  </p>
                  <p className="text-gray-900">{order.customer.birthDate}</p>
                </div>
              </CardContent>
            </Card>

            {/* Endereço de Entrega */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin /> Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="text-gray-900">
                  {order.address.street}, {order.address.number}
                  {order.address.complement
                    ? `, ${order.address.complement}`
                    : ''}
                </p>
                <p className="text-gray-900">{order.address.neighborhood}</p>
                <p className="text-gray-900">
                  {order.address.city} - {order.address.state}
                </p>
                <p className="text-gray-900">CEP: {order.address.zipCode}</p>
              </CardContent>
            </Card>

            {/* Itens do Pedido */}
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
                      <p className="text-xs text-gray-500">
                        Tamanho: {item.size}
                      </p>
                      {item.customizationFee > 0 && (
                        <p className="text-xs text-gray-500">
                          Personalização: {item.customization?.name} #
                          {item.customization?.number}
                        </p>
                      )}
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
          </div>
        </div>
      </div>
    </div>
  );
}

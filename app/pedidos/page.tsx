'use client';

import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useOrders } from '@/hooks/useOrders';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Search,
  ArrowLeft,
  Eye,
  Download,
  Star,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

// Definir interfaces para os tipos
interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
  customization?: {
    name?: string;
    number?: string;
  };
}

interface ShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface CustomerInfo {
  clerkId: string;
  name: string;
  email: string;
  phone: string;
  document: string;
}

type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

interface Order {
  _id: string;
  orderNumber: string;
  customerInfo: CustomerInfo;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderStats {
  total: number;
  delivered: number;
  shipped: number;
  processing: number;
  pending: number;
  cancelled: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    icon: React.ComponentType<any>;
    description: string;
  }
> = {
  pending: {
    label: 'Pendente',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock,
    description: 'Aguardando confirmação do pagamento',
  },
  processing: {
    label: 'Processando',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Seu pedido está sendo preparado',
  },
  shipped: {
    label: 'Enviado',
    color: 'bg-blue-100 text-blue-800',
    icon: Truck,
    description: 'Produto a caminho',
  },
  delivered: {
    label: 'Entregue',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Produto entregue com sucesso',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Pedido cancelado',
  },
};

export default function PedidosPage() {
  const { user, isLoaded } = useUser();
  const [selectedStatus, setSelectedStatus] = useState<'all' | OrderStatus>(
    'all',
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Buscar pedidos usando o hook
  const { orders, stats, pagination, loading, error, refetch } = useOrders({
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    search: searchTerm,
    page: currentPage,
    limit: 10,
  });

  // Redirect se não estiver logado
  if (isLoaded && !user) {
    redirect('/login');
  }

  // Loading state
  if (!isLoaded || loading) {
    return <OrdersSkeleton />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <Link
              href="/perfil"
              className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors font-medium mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao perfil
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-primary-900">
                  Meus Pedidos
                </h1>
                <p className="text-gray-600 mt-1">
                  Acompanhe o status dos seus pedidos e histórico de compras
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-primary-900">
                    {stats.total}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.delivered}
                  </div>
                  <div className="text-sm text-gray-600">Entregues</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.shipped}
                  </div>
                  <div className="text-sm text-gray-600">Enviados</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.processing}
                  </div>
                  <div className="text-sm text-gray-600">Processando</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por número do pedido ou produto..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => {
                    setSelectedStatus('all');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                    selectedStatus === 'all'
                      ? 'bg-primary-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todos ({stats.total})
                </button>
                {(
                  Object.entries(statusConfig) as [
                    OrderStatus,
                    (typeof statusConfig)[OrderStatus],
                  ][]
                ).map(([status, config]) => {
                  const count = stats[status] || 0;
                  return (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                        selectedStatus === status
                          ? 'bg-primary-800 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {config.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <EmptyState
              searchTerm={searchTerm}
              selectedStatus={selectedStatus}
            />
          ) : (
            <>
              <div className="space-y-6">
                {orders.map((order: Order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onViewDetails={() => setSelectedOrder(order)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Anterior
                    </button>

                    <span className="px-4 py-2 text-sm text-gray-600">
                      Página {currentPage} de {pagination.pages}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, pagination.pages),
                        )
                      }
                      disabled={currentPage === pagination.pages}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

// Order Card Component
function OrderCard({
  order,
  onViewDetails,
}: {
  order: Order;
  onViewDetails: () => void;
}) {
  const StatusIcon = statusConfig[order.orderStatus]?.icon || Clock;
  const statusInfo = statusConfig[order.orderStatus] || statusConfig.pending;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-900">
              {order.orderNumber}
            </h3>
            <p className="text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(order.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}
          >
            <StatusIcon className="w-4 h-4 inline mr-2" />
            {statusInfo.label}
          </span>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-900">
              R$ {order.total.toFixed(2).replace('.', ',')}
            </div>
            <div className="text-sm text-gray-600">
              {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
            </div>
          </div>
        </div>
      </div>

      {/* Items Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-medium text-primary-900 mb-3">Produtos</h4>
          <div className="space-y-3">
            {order.items.slice(0, 2).map((item: OrderItem, index: number) => (
              <div key={index} className="flex items-center gap-3">
                <Image
                  width={48}
                  height={48}
                  src={item.image}
                  alt={item.title}
                  className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-primary-900 truncate">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tamanho {item.size} • Qtd: {item.quantity}
                    {item.customization?.name && (
                      <span> • Nome: {item.customization.name}</span>
                    )}
                    {item.customization?.number && (
                      <span> • Nº: {item.customization.number}</span>
                    )}
                  </p>
                </div>
                <div className="text-primary-900 font-medium">
                  R$ {item.price.toFixed(2).replace('.', ',')}
                </div>
              </div>
            ))}
            {order.items.length > 2 && (
              <p className="text-sm text-gray-600 text-center">
                +{order.items.length - 2}{' '}
                {order.items.length - 2 === 1 ? 'item' : 'itens'}
              </p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-primary-900 mb-3">Entrega</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </span>
              {order.shipping === 0 && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  Frete Grátis
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{order.paymentMethod}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : order.paymentStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {order.paymentStatus === 'paid'
                  ? 'Pago'
                  : order.paymentStatus === 'pending'
                  ? 'Pendente'
                  : 'Falhou'}
              </span>
            </div>
            {order.trackingCode && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  Código: {order.trackingCode}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={onViewDetails}
          className="flex items-center gap-2 px-4 py-2 bg-primary-800 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          <Eye className="w-4 h-4" />
          Ver Detalhes
        </button>

        {order.trackingCode && (
          <Link
            href={`/rastreamento/${order.trackingCode}`}
            className="flex items-center gap-2 px-4 py-2 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-lg font-medium transition-colors"
          >
            <Truck className="w-4 h-4" />
            Rastrear
          </Link>
        )}

        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
          <Download className="w-4 h-4" />
          Nota Fiscal
        </button>

        {order.orderStatus === 'delivered' && (
          <button className="flex items-center gap-2 px-4 py-2 bg-accent-100 hover:bg-accent-200 text-accent-700 rounded-lg font-medium transition-colors">
            <Star className="w-4 h-4" />
            Avaliar
          </button>
        )}

        {(order.orderStatus === 'pending' ||
          order.orderStatus === 'processing') && (
          <button className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors">
            <XCircle className="w-4 h-4" />
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({
  searchTerm,
  selectedStatus,
}: {
  searchTerm: string;
  selectedStatus: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-600 mb-2">
        {searchTerm || selectedStatus !== 'all'
          ? 'Nenhum pedido encontrado'
          : 'Você ainda não fez nenhum pedido'}
      </h3>
      <p className="text-gray-500 mb-6">
        {searchTerm || selectedStatus !== 'all'
          ? 'Tente ajustar os filtros ou fazer uma nova busca'
          : 'Que tal explorar nossos produtos e fazer sua primeira compra?'}
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-primary-800 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
      >
        <Package className="w-4 h-4" />
        Explorar Produtos
      </Link>
    </div>
  );
}

// Error State Component
function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erro ao carregar pedidos
          </h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-primary-800 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Order Details Modal placeholder
function OrderDetailsModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  return null; // Será implementado separadamente
}

// Loading Skeleton
function OrdersSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-200 rounded-2xl h-32 animate-pulse mb-8"></div>
          <div className="bg-gray-200 rounded-2xl h-20 animate-pulse mb-8"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-2xl h-48 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

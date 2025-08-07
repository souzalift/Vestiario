'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Calendar,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  _id: string;
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  trackingCode?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  statusBreakdown: Record<string, number>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminPage() {
  const { isAdmin, isLoaded, user, email } = useAdmin();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: 'all',
    search: '',
    startDate: '',
    endDate: '',
  });

  // Estados do modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  // Debug no cliente
  useEffect(() => {
    console.log('🎯 Estado do admin:', {
      isLoaded,
      isAdmin,
      email,
      userId: user?.id,
    });
  }, [isLoaded, isAdmin, email, user]);

  // Verificar acesso admin
  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        console.log('❌ Usuário não logado, redirecionando...');
        router.push('/login');
        return;
      }

      if (!isAdmin) {
        console.log('❌ Usuário não é admin, redirecionando...');
        toast.error(
          'Acesso negado. Você não tem permissão para acessar esta página.',
        );
        router.push('/');
        return;
      }

      console.log('✅ Acesso autorizado para admin');
    }
  }, [isLoaded, user, isAdmin, router]);

  // Carregar pedidos
  const loadOrders = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      setRefreshing(!showLoading);

      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value.toString());
        });

        const response = await fetch(`/api/admin/orders?${params}`);
        const data = await response.json();

        if (data.success) {
          setOrders(data.orders);
          setStats(data.stats);
          setPagination(data.pagination);
        } else {
          toast.error(data.error || 'Erro ao carregar pedidos');
        }
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        toast.error('Erro ao carregar pedidos');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    if (isLoaded && user) {
      loadOrders();
    }
  }, [filters, isLoaded, user, loadOrders]);

  // Funções de filtro
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset para primeira página
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Formatar valores
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Badges de status
  const getStatusBadge = (status: string, type: 'payment' | 'order') => {
    const configs = {
      payment: {
        pending: {
          label: 'Pendente',
          className: 'bg-yellow-100 text-yellow-800',
        },
        approved: {
          label: 'Aprovado',
          className: 'bg-green-100 text-green-800',
        },
        rejected: { label: 'Rejeitado', className: 'bg-red-100 text-red-800' },
        cancelled: {
          label: 'Cancelado',
          className: 'bg-gray-100 text-gray-800',
        },
        refunded: {
          label: 'Estornado',
          className: 'bg-purple-100 text-purple-800',
        },
      },
      order: {
        pending: {
          label: 'Pendente',
          className: 'bg-yellow-100 text-yellow-800',
        },
        confirmed: {
          label: 'Confirmado',
          className: 'bg-blue-100 text-blue-800',
        },
        paid: { label: 'Pago', className: 'bg-green-100 text-green-800' },
        processing: {
          label: 'Processando',
          className: 'bg-orange-100 text-orange-800',
        },
        shipped: {
          label: 'Enviado',
          className: 'bg-indigo-100 text-indigo-800',
        },
        delivered: {
          label: 'Entregue',
          className: 'bg-emerald-100 text-emerald-800',
        },
        cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
        refunded: {
          label: 'Estornado',
          className: 'bg-purple-100 text-purple-800',
        },
      },
    };

    const config = configs[type][
      status as keyof (typeof configs)[typeof type]
    ] || { label: status, className: 'bg-gray-100 text-gray-800' };

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Estados de loading
  if (!isLoaded) {
    return <AdminLoadingPage />;
  }

  if (!user) {
    return (
      <AdminAccessDenied message="Você precisa estar logado para acessar esta página." />
    );
  }

  if (!isAdmin) {
    return (
      <AdminAccessDenied message="Você não tem permissão para acessar esta página." />
    );
  }

  if (loading) {
    return <AdminSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Painel Administrativo
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie pedidos e acompanhe vendas
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => loadOrders(false)}
                variant="outline"
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Atualizar
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Pedidos
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Receita Total
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPrice(stats.totalRevenue)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pendentes
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.statusBreakdown.pending || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Entregues
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.statusBreakdown.delivered || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtros */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Número, nome, email..."
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange('search', e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      handleFilterChange('status', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="processing">Processando</SelectItem>
                      <SelectItem value="shipped">Enviado</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startDate">Data Inicial</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      handleFilterChange('startDate', e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      handleFilterChange('endDate', e.target.value)
                    }
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={() =>
                      setFilters({
                        page: 1,
                        limit: 20,
                        status: 'all',
                        search: '',
                        startDate: '',
                        endDate: '',
                      })
                    }
                    variant="outline"
                  >
                    Limpar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Pedidos */}
          <Card>
            <CardHeader>
              <CardTitle>Pedidos ({pagination?.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-mono text-sm">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {order.customerInfo.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {order.customerInfo.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {order.items.length}{' '}
                            {order.items.length === 1 ? 'item' : 'itens'}
                          </div>
                          <div className="text-xs text-gray-600">
                            {order.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0,
                            )}{' '}
                            unidades
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(order.total)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.paymentStatus, 'payment')}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.orderStatus, 'order')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Detalhes do Pedido {order.orderNumber}
                                  </DialogTitle>
                                </DialogHeader>
                                <OrderDetailsModal order={order} />
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setOrderModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total,
                    )}{' '}
                    de {pagination.total} pedidos
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Anterior
                    </Button>

                    {Array.from(
                      { length: Math.min(5, pagination.pages) },
                      (_, i) => {
                        const page = i + Math.max(1, pagination.page - 2);
                        if (page > pagination.pages) return null;

                        return (
                          <Button
                            key={page}
                            variant={
                              page === pagination.page ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        );
                      },
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Edição */}
      {selectedOrder && (
        <EditOrderModal
          order={selectedOrder}
          open={orderModalOpen}
          onClose={() => {
            setOrderModalOpen(false);
            setSelectedOrder(null);
          }}
          onSave={() => {
            loadOrders(false);
            setOrderModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}

// Componente de detalhes do pedido
function OrderDetailsModal({ order }: { order: Order }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Informações do Cliente */}
      <div>
        <h3 className="font-semibold mb-2">Informações do Cliente</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <p>
            <strong>Nome:</strong> {order.customerInfo.name}
          </p>
          <p>
            <strong>Email:</strong> {order.customerInfo.email}
          </p>
          <p>
            <strong>Telefone:</strong> {order.customerInfo.phone}
          </p>
        </div>
      </div>

      {/* Itens do Pedido */}
      <div>
        <h3 className="font-semibold mb-2">Itens do Pedido</h3>
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-600">
                  Quantidade: {item.quantity}
                </p>
              </div>
              <p className="font-semibold">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-primary-50 rounded-lg">
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total:</span>
            <span className="text-primary-600">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Código de Rastreamento */}
      {order.trackingCode && (
        <div>
          <h3 className="font-semibold mb-2">Rastreamento</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-mono text-sm">{order.trackingCode}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de edição de pedido
function EditOrderModal({
  order,
  open,
  onClose,
  onSave,
}: {
  order: Order;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    trackingCode: order.trackingCode || '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/orders/${order.orderNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Pedido atualizado com sucesso');
        onSave();
      } else {
        toast.error(result.error || 'Erro ao atualizar pedido');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Pedido {order.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="orderStatus">Status do Pedido</Label>
            <Select
              value={formData.orderStatus}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, orderStatus: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="processing">Processando</SelectItem>
                <SelectItem value="shipped">Enviado</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="refunded">Estornado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="paymentStatus">Status do Pagamento</Label>
            <Select
              value={formData.paymentStatus}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, paymentStatus: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="refunded">Estornado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="trackingCode">Código de Rastreamento</Label>
            <Input
              id="trackingCode"
              value={formData.trackingCode}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  trackingCode: e.target.value,
                }))
              }
              placeholder="Ex: BR123456789BR"
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Observações internas..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente de loading inicial
function AdminLoadingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Verificando permissões...</p>
      </div>
    </div>
  );
}

// Componente de acesso negado
function AdminAccessDenied({ message }: { message: string }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-900">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{message}</p>
            <div className="space-y-2">
              <Button onClick={() => router.push('/')} className="w-full">
                Voltar ao Início
              </Button>
              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                className="w-full"
              >
                Fazer Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Skeleton de loading
function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

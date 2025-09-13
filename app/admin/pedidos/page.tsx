'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdmin } from '@/hooks/useAdmin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Firebase e Serviços
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/services/orders.admin';

// UI e Ícones
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  Search,
  Edit,
  Trash2,
  Eye,
  Loader2,
  List,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function AdminPedidosPage() {
  const { isAdmin, isLoaded } = useAdmin();
  const router = useRouter();

  // Estados
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Efeito para proteger a rota e buscar os dados em tempo real
  useEffect(() => {
    if (isLoaded) {
      if (!isAdmin) {
        router.push('/');
        return;
      }

      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const ordersData = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
              updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
            } as Order;
          });
          setOrders(ordersData);
          setLoading(false);
        },
        (err) => {
          console.error('Erro ao carregar pedidos:', err);
          toast.error('Não foi possível carregar os pedidos.');
          setLoading(false);
        },
      );

      return () => unsubscribe();
    }
  }, [isLoaded, isAdmin, router]);

  // Lógica de filtragem e ordenação usando useMemo para performance
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'total-high':
        filtered.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      case 'total-low':
        filtered.sort((a, b) => a.totalPrice - b.totalPrice);
        break;
      case 'newest':
      default:
        // O padrão já é o mais novo, então não precisa fazer nada
        break;
    }

    return filtered;
  }, [orders, searchTerm, statusFilter, sortBy]);

  // Funções de formatação
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  const formatDate = (date: Date) =>
    format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  // Mapeamento de status
  const statusMap: { [key: string]: { text: string; className: string } } = {
    pendente: { text: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
    pago: { text: 'Pago', className: 'bg-green-100 text-green-800' },
    enviado: { text: 'Enviado', className: 'bg-blue-100 text-blue-800' },
    entregue: { text: 'Entregue', className: 'bg-gray-100 text-gray-800' },
    cancelado: { text: 'Cancelado', className: 'bg-red-100 text-red-800' },
  };

  // Mapeamento de status de pagamento
  const paymentStatusMap: {
    [key: string]: { text: string; className: string };
  } = {
    pending: { text: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
    paid: { text: 'Pago', className: 'bg-green-100 text-green-800' },
    failed: { text: 'Falhou', className: 'bg-red-100 text-red-800' },
    refunded: { text: 'Reembolsado', className: 'bg-blue-100 text-blue-800' },
    canceled: { text: 'Cancelado', className: 'bg-gray-100 text-gray-800' },
  };

  // Funções de seleção e exclusão
  const handleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((_id) => _id !== id) : [...prev, id],
    );
  const handleSelectAll = () =>
    setSelectedIds(
      selectedIds.length === filteredOrders.length
        ? []
        : filteredOrders.map((o) => o.id),
    );

  const deleteSelectedOrders = async () => {
    if (
      selectedIds.length === 0 ||
      !confirm(
        `Excluir ${selectedIds.length} pedidos selecionados? Esta ação não pode ser desfeita.`,
      )
    )
      return;
    try {
      await Promise.all(
        selectedIds.map((id) => deleteDoc(doc(db, 'orders', id))),
      );
      toast.success('Pedidos excluídos com sucesso!');
      setSelectedIds([]);
    } catch (error) {
      toast.error('Erro ao excluir pedidos.');
    }
  };

  // Função para exclusão individual
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await deleteDoc(doc(db, 'orders', orderToDelete.id));
      toast.success('Pedido excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir pedido.');
    } finally {
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      toast.success('Status atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar status.');
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gerenciar Pedidos
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredOrders.length} de {orders.length} pedidos
            </p>
          </div>
        </div>

        <Card className="mb-6 border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  className="pl-10"
                  placeholder="Buscar por nº, cliente ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  {Object.keys(statusMap).map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusMap[status].text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="oldest">Mais antigos</SelectItem>
                  <SelectItem value="total-high">Maior total</SelectItem>
                  <SelectItem value="total-low">Menor total</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedIds.length > 0 && (
          <div className="mb-4">
            <Button variant="destructive" onClick={deleteSelectedOrders}>
              <Trash2 className="w-4 h-4 mr-2" /> Excluir Selecionados (
              {selectedIds.length})
            </Button>
          </div>
        )}

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6">
                      <Input
                        className="w-4 h-4"
                        type="checkbox"
                        checked={
                          selectedIds.length === filteredOrders.length &&
                          filteredOrders.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Pedido
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Data
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Cliente
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Pagamento
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      Total
                    </th>
                    <th className="text-right py-4 px-6 font-medium text-gray-900">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const statusInfo = statusMap[order.status] || {
                      text: order.status,
                      className: 'bg-gray-100 text-gray-800',
                    };
                    const paymentInfo = paymentStatusMap[
                      order.paymentStatus ?? 'pending'
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
                      <tr
                        key={order.id}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-6">
                          <Input
                            className="w-4 h-4"
                            type="checkbox"
                            checked={selectedIds.includes(order.id)}
                            onChange={() => handleSelect(order.id)}
                          />
                        </td>
                        <td className="py-4 px-6 font-mono text-gray-800">
                          {order.orderNumber}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">
                            {nomeCliente}
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.customer?.email || 'N/A'}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              handleStatusChange(order.id, value)
                            }
                          >
                            <SelectTrigger
                              className={`w-32 ${
                                statusMap[order.status]?.className
                              }`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(statusMap).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {statusMap[status].text}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentInfo.className}`}
                          >
                            {paymentInfo.text}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 justify-end">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/pedidos/${order.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/pedidos/${order.id}/edit`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setOrderToDelete(order);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum pedido encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog de confirmação de exclusão */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir pedido</DialogTitle>
            </DialogHeader>
            <div>
              Tem certeza que deseja excluir o pedido{' '}
              <span className="font-semibold">
                {orderToDelete?.orderNumber}
              </span>
              ? Esta ação não pode ser desfeita.
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteOrder}
                autoFocus
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

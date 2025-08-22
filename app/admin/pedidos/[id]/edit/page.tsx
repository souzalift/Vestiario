'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdmin } from '@/hooks/useAdmin';
import { getOrderById, updateOrder } from '@/services/orders'; // `updateOrder` é uma nova função
import type { Order } from '@/services/orders';
import { toast } from 'sonner';

// UI e Ícones
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, User, MapPin, Package, Save } from 'lucide-react';

export default function AdminEditOrderPage() {
  const { isAdmin, isLoaded } = useAdmin();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Efeito para proteger a rota e buscar os dados do pedido
  useEffect(() => {
    if (isLoaded) {
      if (!isAdmin) {
        router.push('/');
        return;
      }
      if (orderId) {
        const fetchOrder = async () => {
          try {
            const orderData = await getOrderById(orderId);
            if (orderData) {
              setOrder(orderData);
            } else {
              toast.error('Pedido não encontrado.');
              router.push('/admin/pedidos');
            }
          } catch (error) {
            toast.error('Erro ao carregar o pedido.');
          } finally {
            setLoading(false);
          }
        };
        fetchOrder();
      }
    }
  }, [isLoaded, isAdmin, orderId, router]);

  // Função para lidar com a alteração de qualquer campo do formulário
  const handleInputChange = (
    section: 'customer' | 'address',
    field: string,
    value: string,
  ) => {
    setOrder((prevOrder) => {
      if (!prevOrder) return null;
      return {
        ...prevOrder,
        [section]: {
          ...prevOrder[section],
          [field]: value,
        },
      };
    });
  };

  // Função para salvar as alterações
  const handleSaveChanges = async () => {
    if (!order) return;
    setSaving(true);
    try {
      // Prepara os dados para atualização, excluindo campos que não devem ser alterados diretamente
      const { id, createdAt, ...dataToUpdate } = order;

      await updateOrder(order.id, dataToUpdate);
      toast.success('Pedido atualizado com sucesso!');
      router.push('/admin/pedidos');
    } catch (error) {
      toast.error('Erro ao salvar as alterações.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!order) {
    return null; // Ou uma mensagem de "Pedido não encontrado"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Editar Pedido
              </h1>
              <p className="text-gray-600 mt-1 font-mono">
                {order.orderNumber}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/pedidos">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Pedidos
              </Link>
            </Button>
          </div>

          <div className="space-y-8">
            {/* Dados do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User /> Dados do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={order.customer.firstName}
                    onChange={(e) =>
                      handleInputChange('customer', 'firstName', e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Sobrenome</Label>
                  <Input
                    value={order.customer.lastName}
                    onChange={(e) =>
                      handleInputChange('customer', 'lastName', e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={order.customer.email}
                    onChange={(e) =>
                      handleInputChange('customer', 'email', e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={order.customer.phone}
                    onChange={(e) =>
                      handleInputChange('customer', 'phone', e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>CPF</Label>
                  <Input
                    value={order.customer.document}
                    onChange={(e) =>
                      handleInputChange('customer', 'document', e.target.value)
                    }
                  />
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>CEP</Label>
                    <Input
                      value={order.address.zipCode}
                      onChange={(e) =>
                        handleInputChange('address', 'zipCode', e.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Rua</Label>
                    <Input
                      value={order.address.street}
                      onChange={(e) =>
                        handleInputChange('address', 'street', e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Número</Label>
                    <Input
                      value={order.address.number}
                      onChange={(e) =>
                        handleInputChange('address', 'number', e.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Complemento</Label>
                    <Input
                      value={order.address.complement}
                      onChange={(e) =>
                        handleInputChange(
                          'address',
                          'complement',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Bairro</Label>
                    <Input
                      value={order.address.neighborhood}
                      onChange={(e) =>
                        handleInputChange(
                          'address',
                          'neighborhood',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input
                      value={order.address.city}
                      onChange={(e) =>
                        handleInputChange('address', 'city', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Input
                      value={order.address.state}
                      onChange={(e) =>
                        handleInputChange('address', 'state', e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status do Pedido */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package /> Status do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label>Status</Label>
                <Select
                  value={order.status}
                  onValueChange={(value) =>
                    setOrder((prev) =>
                      prev
                        ? { ...prev, status: value as Order['status'] }
                        : null,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveChanges}
                disabled={saving}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'A guardar...' : 'Guardar Alterações'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

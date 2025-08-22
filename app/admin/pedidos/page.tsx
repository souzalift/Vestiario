'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importações do Firebase para escuta em tempo real
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/services/orders'; // Reutilizamos a interface de Order

export default function AdminPedidosPage() {
  // Estados para guardar os pedidos, o carregamento e possíveis erros
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Efeito que corre quando o componente é montado para "ouvir" as alterações no Firestore
  useEffect(() => {
    setLoading(true);

    // Cria uma consulta para a coleção 'orders', ordenada pela data de criação
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    // onSnapshot cria o "ouvinte" em tempo real.
    // Esta função será chamada imediatamente com os dados atuais e, depois,
    // sempre que houver qualquer alteração na coleção 'orders'.
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const ordersData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          // Converte os Timestamps do Firebase para objetos Date do JavaScript
          const createdAt =
            (data.createdAt as Timestamp)?.toDate() || new Date();
          const updatedAt =
            (data.updatedAt as Timestamp)?.toDate() || new Date();

          return {
            id: doc.id,
            ...data,
            createdAt,
            updatedAt,
          } as Order;
        });

        setOrders(ordersData);
        setLoading(false);
      },
      (err) => {
        // Lida com erros de permissão ou outros problemas do Firestore
        console.error('Erro ao ouvir os pedidos:', err);
        setError(
          'Não foi possível carregar os pedidos. Verifique as permissões do banco de dados.',
        );
        setLoading(false);
      },
    );

    // Função de limpeza: Quando o componente é desmontado, o "ouvinte" é cancelado
    // para evitar consumo desnecessário de recursos.
    return () => unsubscribe();
  }, []); // O array vazio [] garante que este efeito corre apenas uma vez

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const statusMap: { [key: string]: { text: string; className: string } } = {
    pendente: { text: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
    pago: { text: 'Pago', className: 'bg-green-100 text-green-800' },
    enviado: { text: 'Enviado', className: 'bg-blue-100 text-blue-800' },
    entregue: { text: 'Entregue', className: 'bg-gray-100 text-gray-800' },
    cancelado: { text: 'Cancelado', className: 'bg-red-100 text-red-800' },
  };

  // Renderiza um estado de carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Renderiza uma mensagem de erro
  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

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
                const nomeCliente =
                  `${order.customer?.firstName || ''} ${
                    order.customer?.lastName || ''
                  }`.trim() ||
                  order.customer?.name ||
                  'N/A';
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-800">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(order.createdAt, "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{nomeCliente}</div>
                      <div className="text-xs text-gray-500">
                        {order.customer?.email || 'N/A'}
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
                      {formatCurrency(order.totalPrice)}
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

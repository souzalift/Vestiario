'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/services/orders';
import { useRouter } from 'next/navigation';

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

export default function PedidosClientePage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user?.email) {
        setUserEmail(user.email);

        // Busca pedidos do usuário autenticado
        const q = query(
          collection(db, 'orders'),
          where('customer.email', '==', user.email),
          orderBy('createdAt', 'desc'),
        );
        const querySnapshot = await getDocs(q);
        const pedidos: Order[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];
        setOrders(pedidos);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center text-gray-500">
        Carregando pedidos...
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center text-gray-500">
        Faça login para visualizar seus pedidos.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium"
      >
        ← Voltar
      </button>
      <h1 className="text-2xl font-bold mb-8">Meus Pedidos</h1>
      {orders.length === 0 ? (
        <div className="text-center text-gray-500">
          Você ainda não fez nenhum pedido.
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-xl shadow-sm bg-white p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                <div>
                  <span className="font-semibold text-gray-700">Pedido:</span>{' '}
                  <span className="text-gray-900">
                    {order.orderNumber || order.id}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Data:</span>{' '}
                  <span className="text-gray-900">
                    {formatDate(order.createdAt)}
                  </span>
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
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Total:</span>{' '}
                  <span className="text-gray-900">
                    {formatCurrency(order.totalPrice ?? order.total)}
                  </span>
                </div>
              </div>
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
                      <div className="font-medium text-gray-900">
                        {item.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        Quantidade: {item.quantity}
                        {item.size && <span> | Tamanho: {item.size}</span>}
                        {item.customization &&
                          (item.customization.name ||
                            item.customization.number) && (
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
              <div className="mt-4 text-sm text-gray-500">
                <span className="font-semibold text-gray-700">Endereço:</span>{' '}
                {order.address?.street}, {order.address?.number} -{' '}
                {order.address?.city}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

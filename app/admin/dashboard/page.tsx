'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getCountFromServer,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { Users, ShoppingBag, Heart, Shirt, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  link?: string;
}

function StatCard({ title, value, icon, color, link }: StatCardProps) {
  const content = (
    <div
      className={`flex items-center gap-4 p-6 rounded-2xl shadow bg-white border-l-8 ${color}`}
    >
      <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-gray-600">{title}</div>
      </div>
    </div>
  );
  return link ? <Link href={link}>{content}</Link> : content;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    favorites: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const [usersSnap, productsSnap, ordersSnap, favoritesSnap] =
          await Promise.all([
            getCountFromServer(collection(db, 'users')),
            getCountFromServer(collection(db, 'products')),
            getCountFromServer(collection(db, 'orders')),
            getCountFromServer(collection(db, 'favorites')),
          ]);
        setStats({
          users: usersSnap.data().count,
          products: productsSnap.data().count,
          orders: ordersSnap.data().count,
          favorites: favoritesSnap.data().count,
        });

        // Buscar últimos 5 pedidos
        const ordersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          limit(5),
        );
        const ordersDocs = await getDocs(ordersQuery);
        setRecentOrders(
          ordersDocs.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">
            Dashboard Admin
          </h1>

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <>
              {/* Estatísticas principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                  title="Usuários"
                  value={stats.users}
                  icon={<Users className="w-6 h-6 text-blue-600" />}
                  color="border-blue-600"
                  link="/admin/users"
                />
                <StatCard
                  title="Produtos"
                  value={stats.products}
                  icon={<Shirt className="w-6 h-6 text-green-600" />}
                  color="border-green-600"
                  link="/admin/products"
                />
                <StatCard
                  title="Pedidos"
                  value={stats.orders}
                  icon={<ShoppingBag className="w-6 h-6 text-yellow-600" />}
                  color="border-yellow-600"
                  link="/admin/orders"
                />
                <StatCard
                  title="Favoritos"
                  value={stats.favorites}
                  icon={<Heart className="w-6 h-6 text-pink-600" />}
                  color="border-pink-600"
                  link="/admin/favorites"
                />
              </div>

              {/* Últimos pedidos */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Últimos Pedidos
                </h2>
                {recentOrders.length === 0 ? (
                  <div className="text-gray-500">Nenhum pedido recente.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-gray-700 border-b">
                          <th className="py-2 px-4 text-left">Pedido</th>
                          <th className="py-2 px-4 text-left">Cliente</th>
                          <th className="py-2 px-4 text-left">Valor</th>
                          <th className="py-2 px-4 text-left">Status</th>
                          <th className="py-2 px-4 text-left">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.id} className="border-b last:border-0">
                            <td className="py-2 px-4 font-mono">
                              {order.orderNumber || order.id}
                            </td>
                            <td className="py-2 px-4">
                              {order.customerName || order.userId || '-'}
                            </td>
                            <td className="py-2 px-4 font-bold">
                              R${' '}
                              {order.total?.toFixed(2).replace('.', ',') ||
                                '0,00'}
                            </td>
                            <td className="py-2 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold
                              ${
                                order.status === 'delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'processing'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }
                            `}
                              >
                                {order.status || 'Pendente'}
                              </span>
                            </td>
                            <td className="py-2 px-4">
                              {order.createdAt?.toDate
                                ? new Date(
                                    order.createdAt.toDate(),
                                  ).toLocaleString('pt-BR')
                                : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

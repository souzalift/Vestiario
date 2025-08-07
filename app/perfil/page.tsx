'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Settings,
  ShoppingBag,
  Heart,
  Star,
  Shield,
  LogOut,
  Edit3,
  Package,
  Clock,
  CreditCard,
  Gift,
  Trophy,
  ArrowRight,
  Bell,
  Lock,
  CheckCircle,
  Truck,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';

// Interfaces para tipagem
interface UserStats {
  totalOrders: number;
  totalSpent: number;
  favoriteProducts: number;
  memberSince: string;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  createdAt: string;
  orderStatus: string;
  total: number;
  items: Array<{
    title: string;
    quantity: number;
  }>;
}

interface FavoriteProduct {
  _id: string;
  title: string;
  price: number;
  image: string;
  team: string;
}

export default function PerfilPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState('perfil');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  // Redirect se não estiver logado
  if (isLoaded && !user) {
    redirect('/login');
  }

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Carregar estatísticas do usuário
      const [statsResponse, ordersResponse, favoritesResponse] =
        await Promise.all([
          fetch('/api/user/stats'),
          fetch('/api/orders?limit=3'),
          fetch('/api/user/favorites?limit=6'),
        ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setUserStats(statsData);
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.orders || []);
      }

      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json();
        setFavoriteProducts(favoritesData.favorites || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (!isLoaded || loading) {
    return <ProfileSkeleton />;
  }

  const handleSignOut = () => {
    signOut(() => redirect('/'));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <ProfileHeader user={user} userStats={userStats} />

          {/* Profile Navigation */}
          <ProfileNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Profile Content */}
          <div className="mt-8">
            {activeTab === 'perfil' && <ProfileInfo user={user} />}
            {activeTab === 'pedidos' && (
              <OrdersSection recentOrders={recentOrders} />
            )}
            {activeTab === 'favoritos' && (
              <FavoritesSection favoriteProducts={favoriteProducts} />
            )}
            {activeTab === 'configuracoes' && (
              <SettingsSection user={user} onSignOut={handleSignOut} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Profile Header Component
function ProfileHeader({
  user,
  userStats,
}: {
  user: any;
  userStats: UserStats | null;
}) {
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : new Date().getFullYear();

  return (
    <div className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-800 rounded-3xl p-8 text-white">
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            {user?.imageUrl ? (
              <Image
                width={96}
                height={96}
                src={user.imageUrl}
                alt={user.fullName || 'Usuário'}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>
          {userStats && userStats.totalOrders > 0 && (
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-3xl font-bold mb-2">
            {user?.fullName || user?.firstName || 'Torcedor'}
          </h1>
          <p className="text-primary-200 mb-4">
            {user?.primaryEmailAddress?.emailAddress}
          </p>

          {/* Stats */}
          <div className="flex justify-center lg:justify-start gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-400">
                {userStats?.totalOrders || 0}
              </div>
              <div className="text-sm text-primary-200">Pedidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-400">
                {userStats?.favoriteProducts || 0}
              </div>
              <div className="text-sm text-primary-200">Favoritos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-400">
                R$ {userStats?.totalSpent?.toFixed(0) || '0'}
              </div>
              <div className="text-sm text-primary-200">Gastos</div>
            </div>
          </div>
        </div>

        {/* Membership Badge */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
          <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div className="text-sm font-medium">
            {userStats && userStats.totalOrders >= 5 ? 'Membro VIP' : 'Membro'}
          </div>
          <div className="text-xs text-primary-200">Desde {memberSince}</div>
        </div>
      </div>
    </div>
  );
}

// Profile Navigation Component
function ProfileNavigation({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const tabs = [
    { id: 'perfil', name: 'Meu Perfil', icon: User },
    { id: 'pedidos', name: 'Pedidos', icon: Package },
    { id: 'favoritos', name: 'Favoritos', icon: Heart },
    { id: 'configuracoes', name: 'Configurações', icon: Settings },
  ];

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-sm p-2">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-800 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Profile Info Section
function ProfileInfo({ user }: { user: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Personal Information */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-primary-900">
              Informações Pessoais
            </h3>
            <Link
              href="/perfil/editar"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium"
            >
              <Edit3 className="w-4 h-4" />
              Editar
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nome Completo
                  </label>
                  <p className="text-primary-900 font-medium">
                    {user?.fullName || user?.firstName || 'Não informado'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary-100 text-secondary-600 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    E-mail
                  </label>
                  <p className="text-primary-900 font-medium">
                    {user?.primaryEmailAddress?.emailAddress || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-100 text-accent-600 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Telefone
                  </label>
                  <p className="text-primary-900 font-medium">
                    {user?.primaryPhoneNumber?.phoneNumber || 'Não informado'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success-100 text-success-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Membro desde
                  </label>
                  <p className="text-primary-900 font-medium">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('pt-BR')
                      : 'Não informado'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Verification Status */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-primary-900">
              Status da Conta
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {user?.primaryEmailAddress?.verification?.status ===
              'verified' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    E-mail verificado
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 font-medium">
                    E-mail não verificado
                  </span>
                </>
              )}
            </div>

            {user?.primaryPhoneNumber?.verification?.status === 'verified' ? (
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Telefone verificado
                </span>
              </div>
            ) : user?.primaryPhoneNumber ? (
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">
                  Telefone não verificado
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-primary-900 mb-4">
            Ações Rápidas
          </h3>
          <div className="space-y-3">
            <Link
              href="/pedidos"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-primary-900">
                  Ver Pedidos
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link
              href="/favoritos"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-secondary-600" />
                <span className="font-medium text-primary-900">Favoritos</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link
              href="/suporte"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-accent-600" />
                <span className="font-medium text-primary-900">Suporte</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Orders Section - usando dados reais
function OrdersSection({ recentOrders }: { recentOrders: RecentOrder[] }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'delivered':
        return { label: 'Entregue', color: 'bg-green-100 text-green-800' };
      case 'shipped':
        return { label: 'Enviado', color: 'bg-blue-100 text-blue-800' };
      case 'processing':
        return { label: 'Processando', color: 'bg-yellow-100 text-yellow-800' };
      case 'pending':
        return { label: 'Pendente', color: 'bg-gray-100 text-gray-800' };
      case 'cancelled':
        return { label: 'Cancelado', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Desconhecido', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary-900">Pedidos Recentes</h3>
        <Link
          href="/pedidos"
          className="text-primary-600 hover:text-primary-800 font-medium"
        >
          Ver todos
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">
            Nenhum pedido ainda
          </h4>
          <p className="text-gray-500 mb-6">
            Faça seu primeiro pedido e ele aparecerá aqui
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary-800 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Explorar Produtos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recentOrders.map((order) => {
            const statusConfig = getStatusConfig(order.orderStatus);
            const totalItems = order.items.reduce(
              (sum, item) => sum + item.quantity,
              0,
            );

            return (
              <div
                key={order._id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary-900">
                        {order.orderNumber}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                  </div>
                  <div className="font-bold text-primary-900">
                    R$ {order.total.toFixed(2).replace('.', ',')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Favorites Section - usando dados reais
function FavoritesSection({
  favoriteProducts,
}: {
  favoriteProducts: FavoriteProduct[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary-900">
          Produtos Favoritos
        </h3>
        <Link
          href="/favoritos"
          className="text-primary-600 hover:text-primary-800 font-medium"
        >
          Ver todos
        </Link>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">
            Nenhum favorito ainda
          </h4>
          <p className="text-gray-500 mb-6">
            Adicione produtos aos seus favoritos para vê-los aqui
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary-800 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Explorar Produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteProducts.map((product) => (
            <Link
              key={product._id}
              href={`/produto/${product._id}`}
              className="group border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
            >
              <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
                <Image
                  width={200}
                  height={200}
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h4 className="font-medium text-primary-900 mb-1 line-clamp-2">
                {product.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2">{product.team}</p>
              <p className="font-bold text-primary-900">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Settings Section
function SettingsSection({
  user,
  onSignOut,
}: {
  user: any;
  onSignOut: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Account Settings */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-primary-900 mb-6">
          Configurações da Conta
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium text-primary-900">Notificações</p>
                <p className="text-sm text-gray-600">
                  Gerenciar preferências de notificação
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium text-primary-900">Segurança</p>
                <p className="text-sm text-gray-600">
                  Alterar senha e configurações de segurança
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium text-primary-900">
                  Informações Pessoais
                </p>
                <p className="text-sm text-gray-600">
                  Editar nome, e-mail e telefone
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-primary-900 mb-6">
          Zona de Perigo
        </h3>

        <button
          onClick={onSignOut}
          className="flex items-center gap-3 w-full p-4 text-left hover:bg-red-50 rounded-lg transition-colors border border-red-200"
        >
          <LogOut className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Sair da Conta</p>
            <p className="text-sm text-red-600">
              Fazer logout de todos os dispositivos
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

// Loading Skeleton
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-200 rounded-3xl h-48 animate-pulse"></div>
          <div className="mt-8 bg-gray-200 rounded-2xl h-16 animate-pulse"></div>
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-200 rounded-2xl h-64 animate-pulse"></div>
              <div className="bg-gray-200 rounded-2xl h-32 animate-pulse"></div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-200 rounded-2xl h-48 animate-pulse"></div>
              <div className="bg-gray-200 rounded-2xl h-32 animate-pulse"></div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

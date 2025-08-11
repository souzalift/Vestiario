/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Package,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  BarChart3,
  Clock,
  Grid3X3,
  List,
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  featured: boolean;
  tags: string[];
  brand?: string;
  league?: string;
  playerName?: string;
  playerNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
}

interface DashboardStats {
  totalProducts: number;
  totalLeagues: number;
  recentProducts: Product[];
  topProducts: Product[];
  leagueStats: { [key: string]: number };
}

export default function AdminDashboard() {
  const { isAdmin, isLoaded, user } = useAdmin();
  const { userProfile } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (!isAdmin) {
        toast.error('Acesso negado.');
        router.push('/');
        return;
      }
      loadDashboardData();
    }
  }, [isLoaded, user, isAdmin, router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadProducts(), loadStats()]);
    } catch (error) {
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const productsQuery = query(
        productsRef,
        orderBy('createdAt', 'desc'),
        limit(50),
      );
      const snapshot = await getDocs(productsQuery);
      const productsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          price: data.price,
          images: data.images || [],
          sizes: data.sizes || [],
          featured: data.featured || false,
          tags: data.tags || [],
          brand: data.brand,
          league: data.league,
          playerName: data.playerName,
          playerNumber: data.playerNumber,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate
            ? data.updatedAt.toDate()
            : new Date(data.updatedAt),
          slug: data.slug,
        };
      }) as Product[];
      setProducts(productsData);
    } catch (error) {}
  };

  const loadStats = async () => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);

      const allProducts = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          price: data.price,
          images: data.images || [],
          sizes: data.sizes || [],
          featured: data.featured || false,
          tags: data.tags || [],
          brand: data.brand,
          league: data.league,
          playerName: data.playerName,
          playerNumber: data.playerNumber,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate
            ? data.updatedAt.toDate()
            : new Date(data.updatedAt),
          slug: data.slug,
        };
      }) as Product[];

      const leagueStats: { [key: string]: number } = {};
      allProducts.forEach((product) => {
        if (product.league) {
          leagueStats[product.league] = (leagueStats[product.league] || 0) + 1;
        }
      });

      const recentProducts = [...allProducts]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);

      const topProducts = [...allProducts]
        .filter((p) => p.featured)
        .slice(0, 5);

      const dashboardStats: DashboardStats = {
        totalProducts: allProducts.length,
        totalLeagues: Object.keys(leagueStats).length,
        recentProducts,
        topProducts,
        leagueStats,
      };

      setStats(dashboardStats);
    } catch (error) {}
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Dados atualizados!');
  };

  const deleteProduct = async (productId: string, productTitle: string) => {
    if (!confirm(`Excluir "${productTitle}"?`)) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
      toast.success('Produto excluído!');
      await loadDashboardData();
    } catch (error) {
      toast.error('Erro ao excluir produto');
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);

  const formatDate = (date: Date) =>
    date
      ? date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : 'N/A';

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="max-w-sm w-full">
          <CardHeader className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-700">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Você não tem permissão para acessar o painel administrativo.
            </p>
            <Button onClick={() => router.push('/')} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Administrativo
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Olá, {userProfile?.displayName || user.email}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={refreshData}
                variant="outline"
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                {refreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Atualizar
              </Button>
              <Button
                onClick={() => router.push('/admin/products/new')}
                className="bg-gray-900 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Produtos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-gray-900">
                    {stats.totalProducts}
                  </div>
                  <div className="text-xs text-gray-500">
                    em {stats.totalLeagues} ligas
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Ligas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-gray-900">
                    {stats.totalLeagues}
                  </div>
                  <div className="text-xs text-gray-500">
                    diferentes ligas cadastradas
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Produtos Recentes */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Clock className="w-5 h-5" />
                Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <Image
                          width={36}
                          height={36}
                          src={product.images[0]}
                          alt={product.title}
                          className="w-9 h-9 object-cover rounded"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-gray-200 rounded flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Badge variant="secondary">{product.league}</Badge>
                          <span>{formatPrice(product.price)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/admin/products/${product.id}`)
                        }
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteProduct(product.id, product.title)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Produtos em Destaque */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <List className="w-5 h-5" />
                Destaques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats?.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="secondary">{product.league}</Badge>
                        <span>{formatPrice(product.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribuição por Liga */}
          {stats && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <BarChart3 className="w-5 h-5" />
                  Por Liga
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(stats.leagueStats)
                    .sort(([, a], [, b]) => b - a)
                    .map(([league, count]) => (
                      <div key={league} className="bg-gray-50 p-3 rounded">
                        <div className="text-lg font-bold text-gray-900">
                          {count}
                        </div>
                        <div className="text-xs text-gray-600 capitalize">
                          {league}
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-gray-900 h-1 rounded-full"
                            style={{
                              width: `${(count / stats.totalProducts) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {((count / stats.totalProducts) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Produtos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-gray-700">
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Produtos ({products.length})
                </span>
                <Button
                  size="sm"
                  onClick={() => router.push('/admin/products')}
                  variant="outline"
                >
                  Ver Todos
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Produto</th>
                      <th className="text-left py-2 px-2">Liga</th>
                      <th className="text-left py-2 px-2">Preço</th>
                      <th className="text-left py-2 px-2">Criado</th>
                      <th className="text-right py-2 px-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 10).map((product) => (
                      <tr
                        key={product.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            {product.images?.[0] ? (
                              <Image
                                width={32}
                                height={32}
                                src={product.images[0]}
                                alt={product.title}
                                className="w-8 h-8 object-cover rounded"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                <Package className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <span className="font-medium truncate max-w-[120px]">
                              {product.title}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <Badge variant="secondary">{product.league}</Badge>
                        </td>
                        <td className="py-2 px-2 font-medium">
                          {formatPrice(product.price)}
                        </td>
                        <td className="py-2 px-2 text-gray-500">
                          {formatDate(product.createdAt)}
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(`/products/${product.id}`)
                              }
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(`/admin/products/${product.id}`)
                              }
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                deleteProduct(product.id, product.title)
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

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
  where,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Star,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  BarChart3,
  Calendar,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  stock?: number;
  views: number;
  rating: number;
  reviewCount: number;
  images: string[];
  createdAt: any;
}

interface DashboardStats {
  totalProducts: number;
  totalViews: number;
  averageRating: number;
  totalCategories: number;
  recentProducts: Product[];
  topProducts: Product[];
  categoryStats: { [key: string]: number };
}

export default function AdminDashboard() {
  const { isAdmin, isLoaded, user } = useAdmin();
  const { userProfile } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Verificar acesso admin
  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (!isAdmin) {
        toast.error(
          'Acesso negado. Você não tem permissão para acessar esta página.',
        );
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
      console.error('Erro ao carregar dados:', error);
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
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setProducts(productsData);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const loadStats = async () => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);

      let totalViews = 0;
      let totalRating = 0;
      let totalRatingCount = 0;
      const categoryStats: { [key: string]: number } = {};

      const allProducts = snapshot.docs.map((doc) => {
        const data = doc.data() as Product;

        totalViews += data.views || 0;

        if (data.rating && data.reviewCount) {
          totalRating += data.rating * data.reviewCount;
          totalRatingCount += data.reviewCount;
        }

        if (data.category) {
          categoryStats[data.category] =
            (categoryStats[data.category] || 0) + 1;
        }

        const { id: _ignored, ...restData } = data;
        return { id: doc.id, ...restData };
      });

      // Produtos mais recentes
      const recentProducts = allProducts
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);

      // Produtos mais visualizados
      const topProducts = allProducts
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);

      const dashboardStats: DashboardStats = {
        totalProducts: allProducts.length,
        totalViews,
        averageRating:
          totalRatingCount > 0 ? totalRating / totalRatingCount : 0,
        totalCategories: Object.keys(categoryStats).length,
        recentProducts,
        topProducts,
        categoryStats,
      };

      setStats(dashboardStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Dados atualizados com sucesso!');
  };

  const deleteProduct = async (productId: string, productTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${productTitle}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', productId));
      toast.success('Produto excluído com sucesso!');
      await loadDashboardData();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';

    let date: Date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Estados de loading
  if (!isLoaded || loading) {
    return <AdminLoadingPage />;
  }

  if (!user || !isAdmin) {
    return <AdminAccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      <Header />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Dashboard Administrativo
              </h1>
              <p className="text-gray-600 mt-1">
                Bem-vindo, {userProfile?.displayName || user.email}
              </p>
            </div>
            <div className="flex gap-3">
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
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>

          {/* Estatísticas Principais */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-100">
                    Total de Produtos
                  </CardTitle>
                  <Package className="h-5 w-5 text-blue-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalProducts}
                  </div>
                  <p className="text-xs text-blue-200">
                    em {stats.totalCategories} categorias
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-100">
                    Total de Visualizações
                  </CardTitle>
                  <Eye className="h-5 w-5 text-green-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalViews.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-green-200">
                    {Math.round(stats.totalViews / stats.totalProducts)} por
                    produto
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-100">
                    Avaliação Média
                  </CardTitle>
                  <Star className="h-5 w-5 text-yellow-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <p className="text-xs text-yellow-200">⭐⭐⭐⭐⭐ de 5.0</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-100">
                    Categorias Ativas
                  </CardTitle>
                  <BarChart3 className="h-5 w-5 text-purple-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalCategories}
                  </div>
                  <p className="text-xs text-purple-200">
                    categorias diferentes
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Grid de Conteúdo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Produtos Recentes */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Produtos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900 line-clamp-1">
                            {product.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Badge variant="secondary" className="text-xs">
                              {product.category}
                            </Badge>
                            <span>{formatPrice(product.price)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {product.views}
                            </span>
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
                          onClick={() =>
                            deleteProduct(product.id, product.title)
                          }
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

            {/* Produtos Mais Visualizados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Mais Visualizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Eye className="w-3 h-3" />
                          <span>{product.views} views</span>
                          <span>•</span>
                          <span>⭐ {product.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribuição por Categorias */}
          {stats && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Distribuição por Categorias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(stats.categoryStats)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, count]) => (
                      <div key={category} className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {count}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {category}
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                            style={{
                              width: `${(count / stats.totalProducts) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {((count / stats.totalProducts) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista Completa de Produtos */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  Todos os Produtos ({products.length})
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
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Produto</th>
                      <th className="text-left py-3 px-2">Categoria</th>
                      <th className="text-left py-3 px-2">Preço</th>
                      <th className="text-left py-3 px-2">Views</th>
                      <th className="text-left py-3 px-2">Avaliação</th>
                      <th className="text-left py-3 px-2">Criado</th>
                      <th className="text-right py-3 px-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 10).map((product) => (
                      <tr
                        key={product.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.title}
                                className="w-10 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <span className="font-medium text-sm truncate max-w-[200px]">
                              {product.title}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="secondary" className="text-xs">
                            {product.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 font-medium">
                          {formatPrice(product.price)}
                        </td>
                        <td className="py-3 px-2">
                          <span className="flex items-center gap-1 text-sm">
                            <Eye className="w-3 h-3" />
                            {product.views}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="flex items-center gap-1 text-sm">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {product.rating.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600">
                          {formatDate(product.createdAt)}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2 justify-end">
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

// Componente de loading
function AdminLoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-green-600" />
        <p className="text-gray-600 text-lg">Carregando dashboard...</p>
      </div>
    </div>
  );
}

// Componente de acesso negado
function AdminAccessDenied() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
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
            <p className="text-gray-600">
              Você não tem permissão para acessar o painel administrativo.
            </p>
            <div className="space-y-2">
              <Button onClick={() => router.push('/')} className="w-full">
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

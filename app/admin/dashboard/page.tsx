/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
<<<<<<< HEAD
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Package,
  DollarSign,
=======
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
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  BarChart3,
  Clock,
<<<<<<< HEAD
  Star,
  TrendingUp,
  Users,
  ArrowUpRight,
  Grid3X3,
  ShoppingBag,
=======
  Grid3X3,
  List,
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
<<<<<<< HEAD
  slug: string;
=======
  description: string;
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128
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

interface CategoryStat {
  category: string;
  count: number;
  views: number;
  avgPrice: number;
  percentage: number;
}

interface DashboardStats {
  totalProducts: number;
  totalLeagues: number;
  recentProducts: Product[];
  topProducts: Product[];
<<<<<<< HEAD
  topRatedProducts: Product[];
  categoryStats: { [key: string]: number };
  detailedCategoryStats: CategoryStat[];
  avgViewsPerProduct: number;
  mostViewedCategory: string;
  totalReviews: number;
  productsWithViews: number;
  productsWithRating: number;
  totalStock: number;
  avgPrice: number;
=======
  leagueStats: { [key: string]: number };
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128
}

export default function AdminDashboard() {
  const { isAdmin, isLoaded, user } = useAdmin();
  const { userProfile } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
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

  // Carregar dados apenas da API
  const loadDashboardData = async () => {
    setLoading(true);
    try {
<<<<<<< HEAD
      console.log('📊 Carregando estatísticas via API...');

      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Sempre buscar dados frescos
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setStats(result.data);
        console.log('✅ Estatísticas carregadas via API:', {
          produtos: result.data.totalProducts,
          views: result.data.totalViews,
          categorias: result.data.totalCategories,
          avgViews: result.data.avgViewsPerProduct,
        });
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas do dashboard');
    } finally {
      setLoading(false);
    }
=======
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
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128
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
<<<<<<< HEAD
      toast.success('Produto excluído com sucesso!');
      await loadDashboardData(); // Recarregar dados via API
=======
      toast.success('Produto excluído!');
      await loadDashboardData();
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128
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
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Admin
              </h1>
              <p className="text-gray-600 mt-1">
                Bem-vindo,{' '}
                {userProfile?.displayName || user.email?.split('@')[0]}
=======
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
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={refreshData}
                variant="outline"
                disabled={refreshing}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {refreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Atualizar
              </Button>
              <Button
                onClick={() => router.push('/admin/products/new')}
<<<<<<< HEAD
                className="bg-gray-900 hover:bg-gray-800 text-white"
=======
                className="bg-gray-900 text-white"
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          {stats && (
<<<<<<< HEAD
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total de Produtos
                  </CardTitle>
                  <Package className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalProducts.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-gray-500">
                    em {stats.totalCategories} categorias
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total de Visualizações
                  </CardTitle>
                  <Eye className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalViews.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-gray-500">
                    {stats.avgViewsPerProduct.toFixed(1)} por produto
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Avaliação Média
                  </CardTitle>
                  <Star className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(stats.averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      ({stats.totalReviews} avaliações)
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Preço Médio
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(stats.avgPrice)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Estatísticas Secundárias */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Produtos com Views
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.productsWithViews}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(
                          (stats.productsWithViews / stats.totalProducts) *
                          100
                        ).toFixed(1)}
                        % do total
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Produtos Avaliados
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.productsWithRating}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(
                          (stats.productsWithRating / stats.totalProducts) *
                          100
                        ).toFixed(1)}
                        % do total
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Categoria Líder
                      </p>
                      <p className="text-lg font-bold text-gray-900 capitalize">
                        {stats.mostViewedCategory}
                      </p>
                      <p className="text-xs text-gray-500">mais visualizada</p>
                    </div>
                  </div>
=======
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
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128
                </CardContent>
              </Card>
            </div>
          )}

<<<<<<< HEAD
          {/* Grid de Conteúdo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Produtos Recentes */}
            <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Clock className="w-5 h-5" />
                  Produtos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats && stats.recentProducts.length > 0 ? (
                    stats.recentProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {product.images?.[0] ? (
                            <Image
                              width={48}
                              height={48}
                              src={product.images[0]}
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900 line-clamp-1">
                              {product.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Badge
                                variant="outline"
                                className="text-xs border-gray-300"
                              >
                                {product.category}
                              </Badge>
                              <span>{formatPrice(product.price)}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {product.views.toLocaleString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(
                                `/produto/${product.slug || product.id}`,
                              )
                            }
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(`/admin/products/${product.id}`)
                            }
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              deleteProduct(product.id, product.title)
                            }
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum produto encontrado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Produtos Mais Visualizados */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <TrendingUp className="w-5 h-5" />
                  Mais Visualizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats &&
                  stats.topProducts &&
                  stats.topProducts.length > 0 ? (
                    stats.topProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/produto/${product.slug || product.id}`)
                        }
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Eye className="w-3 h-3" />
                            <span>
                              {product.views.toLocaleString('pt-BR')} views
                            </span>
                            <span>•</span>
                            <span>⭐ {product.rating.toFixed(1)}</span>
                          </div>
=======
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
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma visualização ainda</p>
                    </div>
<<<<<<< HEAD
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribuição por Categorias */}
          {stats && stats.detailedCategoryStats.length > 0 && (
            <Card className="mt-6 border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BarChart3 className="w-5 h-5" />
                  Distribuição por Categorias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {stats.detailedCategoryStats.map((categoryStat) => (
                    <div
                      key={categoryStat.category}
                      className="border border-gray-100 p-4 rounded-lg bg-white hover:shadow-sm transition-shadow"
                    >
                      <div className="text-2xl font-bold text-gray-900">
                        {categoryStat.count}
                      </div>
                      <div className="text-sm text-gray-600 capitalize font-medium">
                        {categoryStat.category}
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>
                            {categoryStat.views.toLocaleString('pt-BR')} views
                          </span>
                          <span>{formatPrice(categoryStat.avgPrice)}</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-gray-900 h-2 rounded-full transition-all duration-300"
=======
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
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128
                            style={{
                              width: `${categoryStat.percentage}%`,
                            }}
                          />
                        </div>
<<<<<<< HEAD
                        <div className="text-xs text-gray-500 mt-1">
                          {categoryStat.percentage.toFixed(1)}%
=======
                        <div className="text-xs text-gray-400 mt-1">
                          {((count / stats.totalProducts) * 100).toFixed(1)}%
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

<<<<<<< HEAD
          {/* Lista Completa de Produtos */}
          <Card className="mt-6 border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-gray-900">
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Todos os Produtos (
                  {stats?.totalProducts.toLocaleString('pt-BR')})
=======
          {/* Lista de Produtos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-gray-700">
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Produtos ({products.length})
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128
                </span>
                <Button
                  size="sm"
                  onClick={() => router.push('/admin/products')}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Ver Todos
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
<<<<<<< HEAD
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">
                        Produto
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">
                        Categoria
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">
                        Preço
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">
                        Views
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">
                        Avaliação
                      </th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">
                        Criado
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">
                        Ações
                      </th>
=======
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Produto</th>
                      <th className="text-left py-2 px-2">Liga</th>
                      <th className="text-left py-2 px-2">Preço</th>
                      <th className="text-left py-2 px-2">Criado</th>
                      <th className="text-right py-2 px-2">Ações</th>
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentProducts.slice(0, 10).map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            {product.images?.[0] ? (
                              <Image
<<<<<<< HEAD
                                width={40}
                                height={40}
=======
                                width={32}
                                height={32}
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128
                                src={product.images[0]}
                                alt={product.title}
                                className="w-8 h-8 object-cover rounded"
                              />
                            ) : (
<<<<<<< HEAD
                              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <span className="font-medium text-sm text-gray-900 truncate max-w-[200px]">
=======
                              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                <Package className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <span className="font-medium truncate max-w-[120px]">
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128
                              {product.title}
                            </span>
                          </div>
                        </td>
<<<<<<< HEAD
                        <td className="py-3 px-2">
                          <Badge
                            variant="outline"
                            className="text-xs border-gray-300"
                          >
                            {product.category}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="py-3 px-2">
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <Eye className="w-3 h-3" />
                            {product.views}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <Star className="w-3 h-3 text-yellow-400" />
                            {product.rating.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-500">
=======
                        <td className="py-2 px-2">
                          <Badge variant="secondary">{product.league}</Badge>
                        </td>
                        <td className="py-2 px-2 font-medium">
                          {formatPrice(product.price)}
                        </td>
                        <td className="py-2 px-2 text-gray-500">
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128
                          {formatDate(product.createdAt)}
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(`/produto/${product.id}`)
                              }
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(`/admin/products/${product.id}`)
                              }
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                deleteProduct(product.id, product.title)
                              }
                              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-red-600"
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
      </main>

      <Footer />
    </div>
  );
}
<<<<<<< HEAD

// Componente de loading
function AdminLoadingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 text-lg">Carregando dashboard...</p>
        </div>
      </main>
    </div>
  );
}

// Componente de acesso negado
function AdminAccessDenied() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12 flex items-center justify-center">
        <Card className="w-full max-w-md border border-gray-200 shadow-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <CardTitle className="text-gray-900">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Você não tem permissão para acessar o painel administrativo.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => router.push('/')}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
=======
>>>>>>> e97f73a853fb7a2a9b818f76cbe4e65fc8a78128

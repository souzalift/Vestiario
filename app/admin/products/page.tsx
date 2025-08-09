/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import Header from '@/components/Header';
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
  collection,
  getDocs,
  query,
  orderBy,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  TrendingUp,
  ArrowUpDown,
  Grid3X3,
  List,
  Loader2,
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
  description: string;
  createdAt: any;
  updatedAt?: any;
}

export default function AdminProductsPage() {
  const { isAdmin, isLoaded } = useAdmin();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (isLoaded) {
      if (!isAdmin) {
        router.push('/');
        return;
      }
      loadProducts();
    }
  }, [isLoaded, isAdmin, router]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const productsRef = collection(db, 'products');
      const productsQuery = query(productsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(productsQuery);

      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setProducts(productsData);

      // Extrair categorias únicas
      const uniqueCategories = Array.from(
        new Set(productsData.map((p) => p.category).filter(Boolean)),
      ).sort();
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory,
      );
    }

    // Ordenar
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case 'oldest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'views':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  const deleteProduct = async (productId: string, productTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${productTitle}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', productId));
      toast.success('Produto excluído com sucesso!');
      await loadProducts();
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

    return date.toLocaleDateString('pt-BR');
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
      <Header />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gerenciar Produtos
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredProducts.length} de {products.length} produtos
              </p>
            </div>
            <Button
              onClick={() => router.push('/admin/products/new')}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </div>

          {/* Filtros */}
          <Card className="mb-6 border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Busca */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-gray-400"
                    />
                  </div>
                </div>

                {/* Categoria */}
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full lg:w-48 border-gray-200 focus:border-gray-400">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Ordenação */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full lg:w-48 border-gray-200 focus:border-gray-400">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mais recentes</SelectItem>
                    <SelectItem value="oldest">Mais antigos</SelectItem>
                    <SelectItem value="price-high">Maior preço</SelectItem>
                    <SelectItem value="price-low">Menor preço</SelectItem>
                    <SelectItem value="views">Mais visualizados</SelectItem>
                    <SelectItem value="rating">Melhor avaliados</SelectItem>
                  </SelectContent>
                </Select>

                {/* Modo de visualização */}
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`rounded-none ${
                      viewMode === 'list'
                        ? 'bg-gray-900 hover:bg-gray-800 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-none ${
                      viewMode === 'grid'
                        ? 'bg-gray-900 hover:bg-gray-800 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista/Grid de Produtos */}
          {viewMode === 'list' ? (
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Package className="w-5 h-5 text-gray-600" />
                  Lista de Produtos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-4 px-6 font-medium text-gray-900">
                          Produto
                        </th>
                        <th className="text-left py-4 px-6 font-medium text-gray-900">
                          Categoria
                        </th>
                        <th className="text-left py-4 px-6 font-medium text-gray-900">
                          Preço
                        </th>
                        <th className="text-left py-4 px-6 font-medium text-gray-900">
                          Views
                        </th>
                        <th className="text-left py-4 px-6 font-medium text-gray-900">
                          Avaliação
                        </th>
                        <th className="text-left py-4 px-6 font-medium text-gray-900">
                          Criado
                        </th>
                        <th className="text-right py-4 px-6 font-medium text-gray-900">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              {product.images?.[0] ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.title}
                                  width={64}
                                  height={64}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      '/placeholder-image.jpg';
                                  }}
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                                  <Package className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <h3 className="font-medium text-gray-900 line-clamp-2 max-w-[300px]">
                                  {product.title}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-1 max-w-[300px]">
                                  {product.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge
                              variant="secondary"
                              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              {product.category}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 font-medium text-gray-900">
                            {formatPrice(product.price)}
                          </td>
                          <td className="py-4 px-6">
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              <Eye className="w-4 h-4" />
                              {product.views || 0}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              <Star className="w-4 h-4 text-yellow-500" />
                              {product.rating.toFixed(1)}
                              <span className="text-gray-500">
                                ({product.reviewCount})
                              </span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {formatDate(product.createdAt)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  router.push(`/products/${product.id}`)
                                }
                                title="Visualizar"
                                className="border-gray-300 hover:bg-gray-100"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  router.push(
                                    `/admin/products/${product.id}/edit`,
                                  )
                                }
                                title="Editar"
                                className="border-gray-300 hover:bg-gray-100"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  deleteProduct(product.id, product.title)
                                }
                                className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum produto encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group hover:shadow-lg transition-shadow border-gray-200"
                >
                  <CardContent className="p-0">
                    {/* Imagem */}
                    <div className="relative aspect-square overflow-hidden rounded-t-lg">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              '/placeholder-image.jpg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-400" />
                        </div>
                      )}

                      {/* Badge de categoria */}
                      <Badge
                        variant="secondary"
                        className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-gray-200"
                      >
                        {product.category}
                      </Badge>

                      {/* Ações flutuantes */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => router.push(`/products/${product.id}`)}
                          className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm border border-gray-200 hover:bg-gray-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            router.push(`/admin/products/${product.id}/edit`)
                          }
                          className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm border border-gray-200 hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            deleteProduct(product.id, product.title)
                          }
                          className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm border border-gray-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                        {product.title}
                      </h3>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {product.rating.toFixed(1)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {product.views || 0} views
                        </span>
                        <span>{formatDate(product.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum produto encontrado</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

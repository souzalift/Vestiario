'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
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
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Shirt,
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  List,
  Grid3X3,
  Loader2,
  Star,
  Upload,
  AlertTriangle,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Product } from '@/services/products';
import { Pagination } from '@/components/Pagination';

interface DeletionState {
  type: 'single' | 'multiple' | null;
  product?: { id: string; title: string };
}

export default function AdminProductsPage() {
  const { isAdmin, isLoaded } = useAdmin();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [leagues, setLeagues] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [updatingProducts, setUpdatingProducts] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Estados para o modal de confirmação
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletionState, setDeletionState] = useState<DeletionState>({
    type: null,
  });
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  useEffect(() => {
    if (isLoaded) {
      if (!isAdmin) {
        router.push('/');
        return;
      }

      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const productsData = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
              isActive: data.isActive !== false, // Default to true if not set
            } as Product;
          });

          setProducts(productsData);

          const uniqueLeagues = Array.from(
            new Set(
              productsData.map((p) => p.league).filter((l): l is string => !!l),
            ),
          ).sort();
          setLeagues(uniqueLeagues);

          setLoading(false);
        },
        (err) => {
          console.error('Erro ao carregar produtos:', err);
          toast.error('Não foi possível carregar os produtos.');
          setLoading(false);
        },
      );

      return () => unsubscribe();
    }
  }, [isLoaded, isAdmin, router]);

  // Estatísticas
  const productStats = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.isActive !== false).length;
    const featuredProducts = products.filter((p) => p.featured).length;

    return { totalProducts, activeProducts, featuredProducts };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Aplicar filtros
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.league?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedLeague !== 'all') {
      filtered = filtered.filter(
        (product) => product.league === selectedLeague,
      );
    }

    if (activeFilter !== 'all') {
      filtered = filtered.filter((product) =>
        activeFilter === 'active'
          ? product.isActive !== false
          : product.isActive === false,
      );
    }

    // Aplicar ordenação
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default: // 'newest'
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    return filtered;
  }, [products, searchTerm, selectedLeague, sortBy, activeFilter]);

  // Paginação
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredProducts, currentPage, productsPerPage]);

  const handleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((_id) => _id !== id) : [...prev, id],
    );

  const handleSelectAll = () =>
    setSelectedIds(
      selectedIds.length === filteredProducts.length
        ? []
        : filteredProducts.map((p) => p.id),
    );

  // Funções para abrir o modal
  const openDeleteSingleModal = (product: { id: string; title: string }) => {
    setDeletionState({ type: 'single', product });
    setIsConfirmModalOpen(true);
  };

  const openDeleteMultipleModal = () => {
    if (selectedIds.length === 0) return;
    setDeletionState({ type: 'multiple' });
    setIsConfirmModalOpen(true);
  };

  // Função que executa a exclusão após confirmação
  const handleConfirmDelete = async () => {
    if (deletionState.type === 'single' && deletionState.product) {
      try {
        setUpdatingProducts((prev) => [...prev, deletionState.product!.id]);
        await deleteDoc(doc(db, 'products', deletionState.product.id));
        toast.success(
          `Produto "${deletionState.product.title}" excluído com sucesso!`,
        );
      } catch (error) {
        toast.error('Erro ao excluir produto.');
      } finally {
        setUpdatingProducts((prev) =>
          prev.filter((id) => id !== deletionState.product!.id),
        );
      }
    } else if (deletionState.type === 'multiple') {
      try {
        setUpdatingProducts((prev) => [...prev, ...selectedIds]);
        await Promise.all(
          selectedIds.map((id) => deleteDoc(doc(db, 'products', id))),
        );
        toast.success(`${selectedIds.length} produtos excluídos com sucesso!`);
        setSelectedIds([]);
      } catch (error) {
        toast.error('Erro ao excluir produtos.');
      } finally {
        setUpdatingProducts((prev) =>
          prev.filter((id) => !selectedIds.includes(id)),
        );
      }
    }
    setIsConfirmModalOpen(false);
    setDeletionState({ type: null });
  };

  const toggleProductStatus = async (
    productId: string,
    currentStatus: boolean,
  ) => {
    try {
      setUpdatingProducts((prev) => [...prev, productId]);
      await updateDoc(doc(db, 'products', productId), {
        isActive: !currentStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success(
        `Produto ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`,
      );
    } catch (error) {
      toast.error('Erro ao alterar status do produto.');
    } finally {
      setUpdatingProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  const toggleFeaturedStatus = async (
    productId: string,
    currentStatus: boolean,
  ) => {
    try {
      setUpdatingProducts((prev) => [...prev, productId]);
      await updateDoc(doc(db, 'products', productId), {
        featured: !currentStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success(
        `Produto ${!currentStatus ? 'destacado' : 'removido dos destaques'}!`,
      );
    } catch (error) {
      toast.error('Erro ao alterar status de destaque.');
    } finally {
      setUpdatingProducts((prev) => prev.filter((id) => id !== productId));
    }
  };

  const importProductsFromJson = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const productsToImport = JSON.parse(text);

      if (!Array.isArray(productsToImport)) {
        throw new Error('O ficheiro JSON deve conter uma lista de produtos.');
      }

      let successCount = 0;
      let errorCount = 0;

      for (const product of productsToImport) {
        try {
          if (!product.slug) continue;

          await setDoc(
            doc(db, 'products', product.slug),
            {
              ...product,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );

          successCount++;
        } catch (err) {
          console.error(`Erro ao importar produto ${product.title}:`, err);
          errorCount++;
        }
      }

      toast.success(
        `Importação concluída! ${successCount} produtos processados com sucesso, ${errorCount} com erro.`,
      );
    } catch (err: any) {
      toast.error('Erro ao importar produtos: ' + err.message);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);

  const formatDate = (date: Date) =>
    date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'N/A';

  const hasActiveFilters =
    searchTerm || selectedLeague !== 'all' || activeFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLeague('all');
    setActiveFilter('all');
    setCurrentPage(1);
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gerenciar Produtos
            </h1>
          </div>

          {/* Estatísticas */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-blue-50 px-3 py-2 rounded-lg">
              <p className="text-blue-800 font-medium">
                {productStats.totalProducts}
              </p>
              <p className="text-blue-600 text-sm">Total</p>
            </div>
            <div className="bg-green-50 px-3 py-2 rounded-lg">
              <p className="text-green-800 font-medium">
                {productStats.activeProducts}
              </p>
              <p className="text-green-600 text-sm">Ativos</p>
            </div>
            <div className="bg-amber-50 px-3 py-2 rounded-lg">
              <p className="text-amber-800 font-medium">
                {productStats.featuredProducts}
              </p>
              <p className="text-amber-600 text-sm">Destaques</p>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Button
            onClick={() => router.push('/admin/produtos/novo')}
            className="flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Produto
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex-1 sm:flex-none"
          >
            {importing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Importar JSON
          </Button>
          <Input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="application/json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importProductsFromJson(file);
            }}
          />
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                <Select
                  value={selectedLeague}
                  onValueChange={(value) => {
                    setSelectedLeague(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Liga" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as ligas</SelectItem>
                    {leagues.map((league) => (
                      <SelectItem key={league} value={league}>
                        {league}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mais recentes</SelectItem>
                    <SelectItem value="oldest">Mais antigos</SelectItem>
                    <SelectItem value="price-high">Maior preço</SelectItem>
                    <SelectItem value="price-low">Menor preço</SelectItem>
                    <SelectItem value="name">Nome (A-Z)</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={activeFilter}
                  onValueChange={(v) => {
                    setActiveFilter(v as any);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Indicador de filtros ativos */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-600">Filtros ativos:</span>
                {searchTerm && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Busca: {searchTerm}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setSearchTerm('')}
                    />
                  </Badge>
                )}
                {selectedLeague !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Liga: {selectedLeague}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setSelectedLeague('all')}
                    />
                  </Badge>
                )}
                {activeFilter !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Status: {activeFilter === 'active' ? 'Ativo' : 'Inativo'}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => setActiveFilter('all')}
                    />
                  </Badge>
                )}
                <Button
                  variant="link"
                  onClick={clearFilters}
                  className="h-6 px-2 text-sm"
                >
                  Limpar todos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações em lote */}
        {viewMode === 'list' && selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive" onClick={openDeleteMultipleModal}>
              <Trash2 className="w-4 h-4 mr-2" /> Excluir Selecionados (
              {selectedIds.length})
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  setUpdatingProducts((prev) => [...prev, ...selectedIds]);
                  await Promise.all(
                    selectedIds.map((id) =>
                      setDoc(
                        doc(db, 'products', id),
                        { isActive: false, updatedAt: serverTimestamp() },
                        { merge: true },
                      ),
                    ),
                  );
                  toast.success('Produtos desativados com sucesso!');
                  setSelectedIds([]);
                } catch (error) {
                  toast.error('Erro ao desativar produtos.');
                } finally {
                  setUpdatingProducts((prev) =>
                    prev.filter((id) => !selectedIds.includes(id)),
                  );
                }
              }}
            >
              Desativar Selecionados
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  setUpdatingProducts((prev) => [...prev, ...selectedIds]);
                  await Promise.all(
                    selectedIds.map((id) =>
                      setDoc(
                        doc(db, 'products', id),
                        { isActive: true, updatedAt: serverTimestamp() },
                        { merge: true },
                      ),
                    ),
                  );
                  toast.success('Produtos ativados com sucesso!');
                  setSelectedIds([]);
                } catch (error) {
                  toast.error('Erro ao ativar produtos.');
                } finally {
                  setUpdatingProducts((prev) =>
                    prev.filter((id) => !selectedIds.includes(id)),
                  );
                }
              }}
            >
              Ativar Selecionados
            </Button>
          </div>
        )}

        {/* Visualização em lista */}
        {viewMode === 'list' ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-4 px-6 w-12">
                        <Input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={
                            selectedIds.length === filteredProducts.length &&
                            filteredProducts.length > 0
                          }
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">
                        Produto
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">
                        Liga
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">
                        Preço
                      </th>
                      <th className="text-center py-4 px-6 font-medium text-gray-900">
                        Destaque
                      </th>
                      <th className="text-center py-4 px-6 font-medium text-gray-900">
                        Ativo
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
                    {paginatedProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="py-4 px-6">
                          <Input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={selectedIds.includes(product.id)}
                            onChange={() => handleSelect(product.id)}
                            disabled={updatingProducts.includes(product.id)}
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.title}
                                width={64}
                                height={64}
                                className="w-16 h-16 object-cover rounded-lg border"
                              />
                            ) : (
                              <div className="w-16 h-16 flex items-center justify-center rounded-lg border bg-gray-100">
                                <Shirt
                                  className="w-10 h-10 text-gray-300"
                                  aria-hidden="true"
                                />
                              </div>
                            )}
                            <div>
                              <h3 className="font-medium text-gray-900 line-clamp-2 max-w-[300px]">
                                {product.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-1 max-w-[300px]">
                                {product.brand}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {product.league && (
                            <Badge
                              variant="secondary"
                              className="bg-gray-100 text-gray-700"
                            >
                              {product.league}
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              toggleFeaturedStatus(product.id, product.featured)
                            }
                            disabled={updatingProducts.includes(product.id)}
                          >
                            {updatingProducts.includes(product.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : product.featured ? (
                              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            ) : (
                              <Star className="w-5 h-5 text-gray-400" />
                            )}
                          </Button>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              toggleProductStatus(
                                product.id,
                                product.isActive !== false,
                              )
                            }
                            disabled={updatingProducts.includes(product.id)}
                          >
                            {updatingProducts.includes(product.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : product.isActive !== false ? (
                              <Badge className="bg-green-100 text-green-700">
                                Sim
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700">
                                Não
                              </Badge>
                            )}
                          </Button>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {formatDate(product.createdAt)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 justify-end">
                            <Button size="icon" variant="outline" asChild>
                              <Link
                                href={`/produto/${product.slug}`}
                                target="_blank"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button size="icon" variant="outline" asChild>
                              <Link href={`/admin/produtos/${product.id}/edit`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() =>
                                openDeleteSingleModal({
                                  id: product.id,
                                  title: product.title,
                                })
                              }
                              disabled={updatingProducts.includes(product.id)}
                            >
                              {updatingProducts.includes(product.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum produto encontrado</p>
                    {hasActiveFilters && (
                      <Button
                        variant="link"
                        onClick={clearFilters}
                        className="mt-2"
                      >
                        Limpar filtros
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Visualização em grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden group">
                <div className="relative aspect-square overflow-hidden">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Shirt className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {product.featured && (
                      <Badge className="bg-yellow-500">
                        <Star className="w-3 h-3 fill-white" />
                      </Badge>
                    )}
                    {product.isActive === false && (
                      <Badge variant="destructive">Inativo</Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                    {product.brand}
                  </p>
                  {product.league && (
                    <Badge variant="secondary" className="mb-2">
                      {product.league}
                    </Badge>
                  )}
                  <p className="font-medium text-gray-900 mb-4">
                    {formatPrice(product.price)}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" asChild>
                        <Link href={`/produto/${product.slug}`} target="_blank">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button size="icon" variant="outline" asChild>
                        <Link href={`/admin/produtos/${product.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() =>
                        openDeleteSingleModal({
                          id: product.id,
                          title: product.title,
                        })
                      }
                      disabled={updatingProducts.includes(product.id)}
                    >
                      {updatingProducts.includes(product.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum produto encontrado</p>
                {hasActiveFilters && (
                  <Button
                    variant="link"
                    onClick={clearFilters}
                    className="mt-2"
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {paginatedProducts.length} de {filteredProducts.length}{' '}
              produtos
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md m-4 animate-in fade-in-90">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                Confirmar Exclusão
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deletionState.type === 'single' && (
                <p>
                  Tem a certeza de que quer excluir o produto{' '}
                  <strong className="font-semibold">
                    "{deletionState.product?.title}"
                  </strong>
                  ? Esta ação não pode ser desfeita.
                </p>
              )}
              {deletionState.type === 'multiple' && (
                <p>
                  Tem a certeza de que quer excluir os{' '}
                  <strong className="font-semibold">
                    {selectedIds.length} produtos selecionados
                  </strong>
                  ? Esta ação não pode ser desfeita.
                </p>
              )}
            </CardContent>
            <div className="flex justify-end gap-4 p-6 border-t">
              <Button
                variant="outline"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Confirmar Exclusão
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

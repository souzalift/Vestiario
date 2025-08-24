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
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  createdAt: Date;
  slug: string;
  isActive?: boolean; // <-- Adicione esta linha
}

// Novo tipo para o estado de exclusão
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.league?.toLowerCase().includes(searchTerm.toLowerCase()),
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
      default:
        break;
    }
    return filtered;
  }, [products, searchTerm, selectedLeague, sortBy, activeFilter]);

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
        await deleteDoc(doc(db, 'products', deletionState.product.id));
        toast.success(
          `Produto "${deletionState.product.title}" excluído com sucesso!`,
        );
      } catch (error) {
        toast.error('Erro ao excluir produto.');
      }
    } else if (deletionState.type === 'multiple') {
      try {
        await Promise.all(
          selectedIds.map((id) => deleteDoc(doc(db, 'products', id))),
        );
        toast.success(`${selectedIds.length} produtos excluídos com sucesso!`);
        setSelectedIds([]);
      } catch (error) {
        toast.error('Erro ao excluir produtos.');
      }
    }
    setIsConfirmModalOpen(false);
    setDeletionState({ type: null });
  };

  const importProductsFromJson = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const productsToImport = JSON.parse(text);
      if (!Array.isArray(productsToImport))
        throw new Error('O ficheiro JSON deve conter uma lista de produtos.');
      const importPromises = productsToImport.map((product) => {
        if (!product.slug) return Promise.resolve();
        return setDoc(
          doc(db, 'products', product.slug),
          {
            ...product,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      });
      await Promise.all(importPromises);
      toast.success(
        `Importação concluída! (${productsToImport.length} produtos processados)`,
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
    date ? format(date, 'dd/MM/yyyy') : 'N/A';

  if (!isLoaded || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <>
      <div>
        {/* ... (código do cabeçalho e filtros) ... */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gerenciar Produtos
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredProducts.length} de {products.length} produtos
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/admin/produtos/novo')}>
              <Plus className="w-4 h-4 mr-2" /> Novo Produto
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
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
        </div>
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Liga" />
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
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="oldest">Mais antigos</SelectItem>
                  <SelectItem value="price-high">Maior preço</SelectItem>
                  <SelectItem value="price-low">Menor preço</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={activeFilter}
                onValueChange={(v) => setActiveFilter(v as any)}
              >
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
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
          </CardContent>
        </Card>
        {viewMode === 'list' && selectedIds.length > 0 && (
          <div className="mb-4 flex gap-2">
            <Button variant="destructive" onClick={openDeleteMultipleModal}>
              <Trash2 className="w-4 h-4 mr-2" /> Excluir Selecionados (
              {selectedIds.length})
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
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
                }
              }}
            >
              Desativar Selecionados
            </Button>
          </div>
        )}
        {viewMode === 'list' ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-4 px-6">
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
                    {filteredProducts.map((product) => (
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
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-700"
                          >
                            {product.league}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {product.featured && (
                            <Star className="w-5 h-5 text-yellow-500 mx-auto" />
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {product.isActive !== false ? (
                            <Badge className="bg-green-100 text-green-700">
                              Sim
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700">
                              Não
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {formatDate(product.createdAt)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 justify-end">
                            <Button size="icon" variant="outline" asChild>
                              <Link href={`/produto/${product.slug}`}>
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
                            >
                              <Trash2 className="w-4 h-4" />
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          // ... (código da visualização em grelha) ...
          <div />
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md m-4 animate-fade-in">
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

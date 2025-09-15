'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Loader2,
  Trash2,
  Plus,
  Edit,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
} from 'lucide-react';

// UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

// Fixed coupon schema with better validation
const couponSchema = z
  .object({
    code: z
      .string()
      .min(3, 'O código deve ter pelo menos 3 caracteres.')
      .toUpperCase(),
    type: z.enum(['percentage', 'fixed', 'free_shipping']),
    value: z.union([z.number(), z.literal('')]).optional(),
    expiryDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== 'free_shipping') {
      if (data.value === '' || data.value === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['value'],
          message: 'O valor é obrigatório.',
        });
      } else if (typeof data.value === 'number' && data.value <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['value'],
          message: 'O valor deve ser maior que zero.',
        });
      }
    }
  });

type CouponFormData = z.infer<typeof couponSchema>;

interface Coupon {
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  isActive: boolean;
  expiryDate?: string | null;
  id?: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const couponsPerPage = 5;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      type: 'percentage',
      value: '',
    },
  });

  const typeValue = watch('type');

  useEffect(() => {
    loadCoupons();
  }, []);

  useEffect(() => {
    filterCoupons();
  }, [searchTerm, coupons]);

  useEffect(() => {
    setSelectAll(false);
    setSelectedCoupons([]);
  }, [currentPage, filteredCoupons]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coupons');
      if (!res.ok) throw new Error('Erro ao carregar cupons');
      const data = await res.json();
      setCoupons(data || []);
    } catch {
      toast.error('Erro ao carregar cupons.');
    } finally {
      setLoading(false);
    }
  };

  const filterCoupons = () => {
    if (!searchTerm) {
      setFilteredCoupons(coupons);
      return;
    }

    const filtered = coupons.filter(
      (coupon) =>
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.type.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredCoupons(filtered);
  };

  const onSubmit = async (data: CouponFormData) => {
    try {
      const apiData = {
        ...data,
        value: data.type === 'free_shipping' ? 0 : Number(data.value) || 0,
        expiryDate: data.expiryDate || null,
        isActive: true,
      };

      const url = editingCoupon
        ? `/api/coupons/${editingCoupon.code}`
        : '/api/coupons';
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Erro ao salvar cupom');
      }

      toast.success(
        editingCoupon
          ? `Cupom "${data.code}" atualizado com sucesso!`
          : `Cupom "${data.code}" criado com sucesso!`,
      );

      resetForm();
      loadCoupons();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar cupom.');
    }
  };

  const resetForm = () => {
    reset({
      type: 'percentage',
      value: '',
      code: '',
      expiryDate: '',
    });
    setEditingCoupon(null);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setValue('code', coupon.code);
    setValue('type', coupon.type);
    setValue('value', coupon.type === 'free_shipping' ? '' : coupon.value);
    setValue('expiryDate', coupon.expiryDate || '');
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/coupons/${coupon.code}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Erro ao alterar status');
      }

      toast.success(`Status do cupom "${coupon.code}" alterado com sucesso!`);
      loadCoupons();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar status do cupom.');
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    try {
      const res = await fetch(`/api/coupons/${code}`, { method: 'DELETE' });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Erro ao apagar cupom');
      }

      toast.success(`Cupom "${code}" apagado com sucesso!`);
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
      loadCoupons();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao apagar cupom.');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const res = await fetch('/api/coupons/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codes: selectedCoupons }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Erro ao apagar cupons');
      }

      toast.success(`${selectedCoupons.length} cupons apagados com sucesso!`);
      setBulkDeleteDialogOpen(false);
      setSelectedCoupons([]);
      loadCoupons();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao apagar cupons.');
    }
  };

  const toggleSelectCoupon = (code: string) => {
    if (selectedCoupons.includes(code)) {
      setSelectedCoupons(selectedCoupons.filter((c) => c !== code));
    } else {
      setSelectedCoupons([...selectedCoupons, code]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedCoupons([]);
    } else {
      const currentPageCoupons = filteredCoupons.slice(
        (currentPage - 1) * couponsPerPage,
        currentPage * couponsPerPage,
      );
      setSelectedCoupons(currentPageCoupons.map((c) => c.code));
    }
    setSelectAll(!selectAll);
  };

  // Pagination logic
  const indexOfLastCoupon = currentPage * couponsPerPage;
  const indexOfFirstCoupon = indexOfLastCoupon - couponsPerPage;
  const currentCoupons = filteredCoupons.slice(
    indexOfFirstCoupon,
    indexOfLastCoupon,
  );
  const totalPages = Math.ceil(filteredCoupons.length / couponsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Gerenciar Cupons
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Criar/Editar cupom */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-800">
                  {editingCoupon ? 'Editar Cupom' : 'Criar Novo Cupom'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="code" className="text-gray-700">
                      Código do Cupom *
                    </Label>
                    <Input
                      id="code"
                      {...register('code')}
                      placeholder="BEMVINDO10"
                      className="mt-1"
                      disabled={!!editingCoupon}
                    />
                    {errors.code && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.code.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-700">Tipo de Desconto *</Label>
                    <select
                      {...register('type')}
                      className="w-full mt-1 p-2 border rounded-md bg-white"
                      onChange={(e) => {
                        setValue('type', e.target.value as any);
                        if (e.target.value === 'free_shipping') {
                          setValue('value', '');
                        }
                      }}
                    >
                      <option value="percentage">Percentagem (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                      <option value="free_shipping">Frete Grátis</option>
                    </select>
                  </div>

                  {['percentage', 'fixed'].includes(typeValue) && (
                    <div>
                      <Label htmlFor="value" className="text-gray-700">
                        Valor *
                      </Label>
                      <Input
                        id="value"
                        type="number"
                        step="0.01"
                        {...register('value', {
                          setValueAs: (v) => (v === '' ? '' : Number(v)),
                        })}
                        placeholder={
                          typeValue === 'percentage' ? '10' : '25.99'
                        }
                        className="mt-1"
                      />
                      {errors.value && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.value.message}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="expiryDate" className="text-gray-700">
                      Data de Expiração (opcional)
                    </Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      {...register('expiryDate')}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Deixe em branco para cupom sem expiração.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : editingCoupon ? (
                        <Edit className="w-4 h-4 mr-2" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      {editingCoupon ? 'Atualizar' : 'Criar'} Cupom
                    </Button>

                    {editingCoupon && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Listagem de cupons */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>Cupons Existentes</CardTitle>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar cupons..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    {selectedCoupons.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setBulkDeleteDialogOpen(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir ({selectedCoupons.length})
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                    <p>Carregando cupons...</p>
                  </div>
                ) : filteredCoupons.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    {searchTerm ? (
                      <>
                        <p className="mb-2">
                          Nenhum cupom encontrado para "{searchTerm}".
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setSearchTerm('')}
                        >
                          Limpar busca
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="mb-2">
                          Nenhum cupom cadastrado no momento.
                        </p>
                        <p className="text-sm">
                          Crie seu primeiro cupom usando o formulário ao lado.
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {currentCoupons.map((coupon) => (
                        <div
                          key={coupon.code}
                          className="flex flex-col sm:flex-row items-start sm:items-center p-4 bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow gap-3"
                        >
                          <div className="flex items-start mr-3 mt-1">
                            <div
                              className="cursor-pointer mt-1"
                              onClick={() => toggleSelectCoupon(coupon.code)}
                            >
                              {selectedCoupons.includes(coupon.code) ? (
                                <CheckSquare className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Square className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </div>

                          <div className="flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <p className="font-mono font-bold text-lg text-gray-900">
                                {coupon.code}
                              </p>
                              <Badge
                                variant={
                                  coupon.isActive ? 'default' : 'secondary'
                                }
                                className={
                                  coupon.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }
                              >
                                {coupon.isActive ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-600 mb-1">
                              {coupon.type === 'percentage'
                                ? `${coupon.value}% de desconto`
                                : coupon.type === 'fixed'
                                ? `R$ ${coupon.value.toFixed(2)} de desconto`
                                : 'Frete grátis'}
                            </p>

                            <p className="text-xs text-gray-500">
                              {coupon.expiryDate
                                ? `Expira em: ${new Date(
                                    coupon.expiryDate,
                                  ).toLocaleDateString('pt-BR')}`
                                : 'Sem data de expiração'}
                            </p>
                          </div>

                          {/* Botões: empilhados no mobile, em linha no desktop */}
                          <div className="flex flex-row items-stretch sm:items-center gap-2 mt-3 sm:mt-0">
                            <div className="flex items-center space-x-2 sm:space-x-2">
                              <Switch
                                checked={coupon.isActive}
                                onCheckedChange={() =>
                                  handleToggleStatus(coupon)
                                }
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditCoupon(coupon)}
                              className="w-8 h-8"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                setCouponToDelete(coupon);
                                setDeleteDialogOpen(true);
                              }}
                              className="w-8 h-8"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between border-t pt-4">
                        <div className="text-sm text-muted-foreground">
                          Mostrando {indexOfFirstCoupon + 1}-
                          {Math.min(indexOfLastCoupon, filteredCoupons.length)}{' '}
                          de {filteredCoupons.length} cupons
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>

                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                          ).map((page) => (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? 'default' : 'outline'
                              }
                              size="sm"
                              onClick={() => paginate(page)}
                            >
                              {page}
                            </Button>
                          ))}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog de exclusão individual */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir cupom</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              Tem certeza que deseja excluir o cupom{' '}
              <span className="font-semibold">{couponToDelete?.code}</span>?
              Esta ação não pode ser desfeita.
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (couponToDelete) {
                    await handleDeleteCoupon(couponToDelete.code);
                  }
                }}
                autoFocus
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de exclusão em massa */}
        <Dialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir múltiplos cupons</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              Tem certeza que deseja excluir {selectedCoupons.length} cupom
              {selectedCoupons.length > 1 ? 's' : ''}? Esta ação não pode ser
              desfeita.
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBulkDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                autoFocus
              >
                Excluir {selectedCoupons.length} cupom
                {selectedCoupons.length > 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  getAllCoupons,
  createCoupon,
  deleteCouponByCode,
  Coupon,
} from '@/services/coupons';
import { Loader2, Trash2, Plus } from 'lucide-react';

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

// --- Schema atualizado ---
const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'O código deve ter pelo menos 3 caracteres.')
    .toUpperCase(),
  type: z.enum(['percentage', 'fixed', 'free_shipping']),
  value: z.coerce
    .number()
    .min(0.01, 'O valor deve ser maior que zero.')
    .optional(),
});

type CouponFormData = z.infer<typeof couponSchema>;

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const allCoupons = await getAllCoupons();
      setCoupons(allCoupons);
    } catch {
      toast.error('Erro ao carregar cupons.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CouponFormData) => {
    try {
      await createCoupon({
        ...data,
        isActive: true,
        value: data.type === 'free_shipping' ? 0 : data.value ?? 0,
      });
      toast.success(`Cupom "${data.code}" criado com sucesso!`);
      reset();
      loadCoupons();
    } catch {
      toast.error('Erro ao criar cupom.');
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    try {
      await deleteCouponByCode(code);
      toast.success(`Cupom "${code}" apagado com sucesso!`);
      loadCoupons();
    } catch {
      toast.error('Erro ao apagar cupom.');
    }
  };

  const typeValue = watch('type');

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Gerenciar Cupons
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Criar cupom */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Cupom</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="code">Código do Cupom</Label>
                  <Input
                    id="code"
                    {...register('code')}
                    placeholder="BEMVINDO10"
                  />
                  {errors.code && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.code.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Tipo de Desconto</Label>
                  <select
                    {...register('type')}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="percentage">Percentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                    <option value="free_shipping">Frete Grátis</option>
                  </select>
                </div>

                {/* Mostrar campo de valor apenas para percentage ou fixed */}
                {['percentage', 'fixed'].includes(typeValue) && (
                  <div>
                    <Label htmlFor="value">Valor</Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      {...register('value')}
                      placeholder="10"
                    />
                    {errors.value && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.value.message}
                      </p>
                    )}
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Criar Cupom
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Listagem de cupons */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cupons Existentes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>A carregar...</p>
              ) : (
                <div className="space-y-4">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-md border"
                    >
                      <div>
                        <p className="font-mono font-bold text-lg">
                          {coupon.code}
                        </p>
                        <p className="text-sm text-gray-600">
                          {coupon.type === 'percentage'
                            ? `${coupon.value}% de desconto`
                            : coupon.type === 'fixed'
                            ? `R$ ${coupon.value.toFixed(2)} de desconto`
                            : 'Frete grátis'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            coupon.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {coupon.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            setCouponToDelete(coupon);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir cupom</DialogTitle>
          </DialogHeader>
          <div>
            Tem certeza que deseja excluir o cupom{' '}
            <span className="font-semibold">{couponToDelete?.code}</span>? Esta
            ação não pode ser desfeita.
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
                  setDeleteDialogOpen(false);
                  setCouponToDelete(null);
                }
              }}
              autoFocus
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

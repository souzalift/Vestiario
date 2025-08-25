'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { getAllCoupons, createCoupon, Coupon } from '@/services/coupons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// UI e Ícones
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Tag, Plus } from 'lucide-react';

const couponSchema = z.object({
  code: z
    .string()
    .min(3, 'O código deve ter pelo menos 3 caracteres.')
    .toUpperCase(),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0.01, 'O valor deve ser maior que zero.'),
});

type CouponFormData = z.infer<typeof couponSchema>;

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
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
    } catch (error) {
      toast.error('Erro ao carregar cupons.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CouponFormData) => {
    try {
      await createCoupon({ ...data, isActive: true });
      toast.success(`Cupom "${data.code}" criado com sucesso!`);
      reset();
      loadCoupons();
    } catch (error) {
      toast.error('Erro ao criar cupcuo.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Gerenciar Cupons
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.type.message}
                    </p>
                  )}
                </div>
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}{' '}
                  Criar Cupom
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
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
                            : `R$ ${coupon.value.toFixed(2)} de desconto`}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          coupon.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {coupon.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

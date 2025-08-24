'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

// Libs de formulário
import { useForm, Controller, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// UI e Ícones
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Package,
  MapPin,
  User,
  Loader2,
  Shield,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// Esquema de validação com Zod
const checkoutSchema = z.object({
  firstName: z.string().min(2, 'Nome é obrigatório'),
  lastName: z.string().min(2, 'Sobrenome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido (inclua o DDD)'),
  document: z.string().min(11, 'CPF inválido'),
  zipCode: z.string().min(8, 'CEP inválido'),
  street: z.string().min(3, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(3, 'Bairro é obrigatório'),
  city: z.string().min(3, 'Cidade é obrigatória'),
  state: z
    .string()
    .min(2, 'Estado é obrigatório')
    .max(2, 'Use a sigla (ex: BA)'),
  orderNotes: z.string().optional(),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos de uso',
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items: cartItems,
    clearCart,
    cartCount,
    subtotal,
    shippingPrice,
    totalPrice,
  } = useCart();
  const { userProfile, loading: authLoading } = useAuth();

  const [isClient, setIsClient] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  useEffect(() => {
    setIsClient(true);
    if (cartCount === 0 && isClient) {
      toast.error('O seu carrinho está vazio!');
      router.push('/');
    }
  }, [cartCount, router, isClient]);

  useEffect(() => {
    if (!authLoading && userProfile) {
      setValue('firstName', userProfile.firstName || '');
      setValue('lastName', userProfile.lastName || '');
      setValue('email', userProfile.email || '');
      setValue('phone', userProfile.phoneNumber || '');
      setValue('document', userProfile.cpf || '');
      if (userProfile.address) {
        setValue('zipCode', userProfile.address.zipCode || '');
        setValue('street', userProfile.address.street || '');
        setValue('number', userProfile.address.number || '');
        setValue('complement', userProfile.address.complement || '');
        setValue('neighborhood', userProfile.address.neighborhood || '');
        setValue('city', userProfile.address.city || '');
        setValue('state', userProfile.address.state || '');
      }
    }
  }, [userProfile, authLoading, setValue]);

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );
      const data = await response.json();
      if (!data.erro) {
        setValue('street', data.logouro || '', { shouldValidate: true });
        setValue('neighborhood', data.bairro || '', { shouldValidate: true });
        setValue('city', data.localidade || '', { shouldValidate: true });
        setValue('state', data.uf || '', { shouldValidate: true });
        toast.success('Endereço encontrado!');
      } else {
        toast.error('CEP não encontrado');
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    }
  };

  const processPayment = async (data: CheckoutFormData) => {
    if (authLoading) {
      toast.info('A aguardar informações do utilizador...');
      return;
    }
    try {
      const orderPayload = {
        userId: userProfile?.uid || 'GUEST_USER',
        items: cartItems,
        customer: {
          firstName: data.firstName,
          lastName: data.lastName,
          name: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
          phone: data.phone,
          document: data.document,
        },
        address: {
          zipCode: data.zipCode,
          street: data.street,
          number: data.number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
        },
        subtotal,
        shippingPrice,
        totalPrice,
        notes: data.orderNotes,
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const responseData = await response.json();
      if (!response.ok)
        throw new Error(
          responseData.error || 'Erro ao criar a preferência de pagamento.',
        );

      if (responseData.init_point) {
        clearCart();
        window.location.href = responseData.init_point;
      } else {
        throw new Error('URL de pagamento não recebida.');
      }
    } catch (error: any) {
      toast.error(
        error.message || 'Erro ao processar pagamento. Tente novamente.',
      );
    }
  };

  const onInvalid = () => {
    toast.error('Formulário incompleto!', {
      description:
        'Por favor, verifique os campos em vermelho e tente novamente.',
    });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit(processPayment, onInvalid)}>
        <main className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Finalizar Compra
                </h1>
                <p className="text-gray-600 mt-1">
                  Revise os seus dados e finalize o seu pedido.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/carrinho">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Carrinho
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User /> Dados Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nome *</Label>
                        <Input
                          id="firstName"
                          {...register('firstName')}
                          className={errors.firstName ? 'border-red-500' : ''}
                        />
                        {errors.firstName && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Sobrenome *</Label>
                        <Input
                          id="lastName"
                          {...register('lastName')}
                          className={errors.lastName ? 'border-red-500' : ''}
                        />
                        {errors.lastName && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          {...register('phone')}
                          className={errors.phone ? 'border-red-500' : ''}
                        />
                        {errors.phone && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="document">CPF *</Label>
                      <Input
                        id="document"
                        {...register('document')}
                        className={errors.document ? 'border-red-500' : ''}
                      />
                      {errors.document && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.document.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin /> Endereço de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="zipCode">CEP *</Label>
                        <Input
                          id="zipCode"
                          {...register('zipCode')}
                          onBlur={(e) => fetchAddressByCep(e.target.value)}
                          className={errors.zipCode ? 'border-red-500' : ''}
                        />
                        {errors.zipCode && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.zipCode.message}
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="street">Rua *</Label>
                        <Input
                          id="street"
                          {...register('street')}
                          className={errors.street ? 'border-red-500' : ''}
                        />
                        {errors.street && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.street.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="number">Número *</Label>
                        <Input
                          id="number"
                          {...register('number')}
                          className={errors.number ? 'border-red-500' : ''}
                        />
                        {errors.number && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.number.message}
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="complement">Complemento</Label>
                        <Input id="complement" {...register('complement')} />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="neighborhood">Bairro *</Label>
                        <Input
                          id="neighborhood"
                          {...register('neighborhood')}
                          className={
                            errors.neighborhood ? 'border-red-500' : ''
                          }
                        />
                        {errors.neighborhood && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.neighborhood.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="city">Cidade *</Label>
                        <Input
                          id="city"
                          {...register('city')}
                          className={errors.city ? 'border-red-500' : ''}
                        />
                        {errors.city && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="state">Estado *</Label>
                        <Input
                          id="state"
                          {...register('state')}
                          className={errors.state ? 'border-red-500' : ''}
                        />
                        {errors.state && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.state.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package /> Observações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Informações adicionais..."
                      {...register('orderNotes')}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Controller
                        name="acceptedTerms"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="terms"
                            className={
                              errors.acceptedTerms ? 'border-red-500' : ''
                            }
                          />
                        )}
                      />
                      <Label htmlFor="terms" className="text-sm">
                        Aceito os{' '}
                        <Link href="/termos" className="underline">
                          termos de uso
                        </Link>
                        *
                      </Label>
                    </div>
                    {errors.acceptedTerms && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.acceptedTerms.message}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Produtos ({cartCount})</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex gap-3">
                            <Image
                              src={item.image}
                              alt={item.title}
                              width={64}
                              height={64}
                              className="rounded-lg bg-gray-100 object-cover"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-sm truncate">
                                {item.title}
                              </h5>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-600">
                                  Qtd: {item.quantity}
                                </span>
                                <span className="font-semibold text-sm">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-medium">
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frete</span>
                        <span className="font-medium">
                          {shippingPrice === 0
                            ? 'Grátis'
                            : formatPrice(shippingPrice)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-xl">
                        <span>Total</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                    <Separator />
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 text-base"
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="mr-2 h-4 w-4" />
                      )}
                      Pagar com Mercado Pago
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
                      <Shield className="w-4 h-4" />
                      <span>Compra 100% segura</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </form>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Package,
  MapPin,
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  AlertCircle,
  Palette,
  Tag,
  Calendar,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { calculateShipping } from '@/lib/shipping';

interface DeliveryAddress {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  document: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems, clearCart, getItemCount, getTotal } = useCart();

  // Estados do formulário
  const [customerData, setCustomerData] = useState<CustomerData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    document: '',
  });

  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const [orderNotes, setOrderNotes] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Redirecionar se carrinho vazio
  useEffect(() => {
    if (cartItems.length === 0) {
      toast.error('Seu carrinho está vazio!');
      router.push('/');
    }
  }, [cartItems, router]);

  // Calcular totais
  const totalItems = getItemCount();
  const shippingInfo = calculateShipping(totalItems);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const baseSubtotal = cartItems.reduce(
    (sum, item) => sum + (item.basePrice || item.price) * item.quantity,
    0,
  );
  const totalCustomizationFee = cartItems.reduce(
    (sum, item) => sum + (item.customizationFee || 0) * item.quantity,
    0,
  );
  const shipping = shippingInfo.price;
  const total = subtotal + shipping;

  // Formatação de preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Buscar endereço por CEP
  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );
      const data = await response.json();

      if (!data.erro) {
        setDeliveryAddress((prev) => ({
          ...prev,
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        }));
        toast.success('Endereço encontrado!');
      } else {
        toast.error('CEP não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar CEP');
    }
  };

  // Validação do formulário
  const validateForm = () => {
    const errors: string[] = [];

    // Validar dados do cliente
    if (!customerData.firstName.trim()) errors.push('Nome é obrigatório');
    if (!customerData.lastName.trim()) errors.push('Sobrenome é obrigatório');
    if (!customerData.email.trim()) errors.push('Email é obrigatório');
    if (!customerData.phone.trim()) errors.push('Telefone é obrigatório');
    if (!customerData.document.trim()) errors.push('CPF é obrigatório');

    // Validar endereço
    if (!deliveryAddress.zipCode.trim()) errors.push('CEP é obrigatório');
    if (!deliveryAddress.street.trim()) errors.push('Rua é obrigatória');
    if (!deliveryAddress.number.trim()) errors.push('Número é obrigatório');
    if (!deliveryAddress.neighborhood.trim())
      errors.push('Bairro é obrigatório');
    if (!deliveryAddress.city.trim()) errors.push('Cidade é obrigatória');
    if (!deliveryAddress.state.trim()) errors.push('Estado é obrigatório');

    // Validar termos
    if (!acceptedTerms) errors.push('Aceite os termos de uso');
    if (!acceptedPrivacy) errors.push('Aceite a política de privacidade');

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (customerData.email && !emailRegex.test(customerData.email)) {
      errors.push('Email inválido');
    }

    // Validar CPF (básico)
    const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
    if (customerData.document && !cpfRegex.test(customerData.document)) {
      errors.push('CPF inválido');
    }

    return errors;
  };

  // Processar pagamento com Mercado Pago
  const processPayment = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    setProcessingPayment(true);

    try {
      // Preparar dados para o Mercado Pago
      const orderData = {
        customer: customerData,
        address: deliveryAddress,
        items: cartItems.map((item) => ({
          id: item.productId,
          title: item.title,
          description: `Tamanho: ${item.size}${
            item.customization?.name || item.customization?.number
              ? ` - Personalização: ${item.customization.name || ''} ${
                  item.customization.number
                    ? '#' + item.customization.number
                    : ''
                }`.trim()
              : ''
          }`,
          quantity: item.quantity,
          unit_price: item.price,
          picture_url: item.image,
          category_id: item.category || 'sports',
        })),
        shipping: {
          cost: shipping,
          mode: shipping === 0 ? 'free' : 'standard',
        },
        notes: orderNotes,
        total: total,
      };

      console.log('📦 Dados do pedido:', orderData);

      // Chamar API para criar preferência no Mercado Pago
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success && data.preferenceId) {
        // Salvar dados do pedido no localStorage temporariamente
        localStorage.setItem(
          'pendingOrder',
          JSON.stringify({
            ...orderData,
            preferenceId: data.preferenceId,
            createdAt: new Date().toISOString(),
          }),
        );

        // Redirecionar para o Mercado Pago
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.error || 'Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('❌ Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Se carrinho vazio, não renderizar
  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Finalizar Compra
              </h1>
              <p className="text-gray-600 mt-1">
                Revise seus dados e finalize seu pedido
              </p>
            </div>
            <Link href="/carrinho">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Carrinho
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulário */}
            <div className="lg:col-span-2 space-y-8">
              {/* Dados Pessoais */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <User className="h-5 w-5" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="firstName"
                        className="text-gray-700 font-medium"
                      >
                        Nome *
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Seu primeiro nome"
                        value={customerData.firstName}
                        onChange={(e) =>
                          setCustomerData({
                            ...customerData,
                            firstName: e.target.value,
                          })
                        }
                        className="mt-1 border-gray-200 focus:border-gray-400"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="lastName"
                        className="text-gray-700 font-medium"
                      >
                        Sobrenome *
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Seu sobrenome"
                        value={customerData.lastName}
                        onChange={(e) =>
                          setCustomerData({
                            ...customerData,
                            lastName: e.target.value,
                          })
                        }
                        className="mt-1 border-gray-200 focus:border-gray-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-gray-700 font-medium"
                      >
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={customerData.email}
                        onChange={(e) =>
                          setCustomerData({
                            ...customerData,
                            email: e.target.value,
                          })
                        }
                        className="mt-1 border-gray-200 focus:border-gray-400"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="phone"
                        className="text-gray-700 font-medium"
                      >
                        <Phone className="w-4 h-4 inline mr-1" />
                        Telefone *
                      </Label>
                      <Input
                        id="phone"
                        placeholder="(11) 99999-9999"
                        value={customerData.phone}
                        onChange={(e) =>
                          setCustomerData({
                            ...customerData,
                            phone: e.target.value,
                          })
                        }
                        className="mt-1 border-gray-200 focus:border-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="document"
                      className="text-gray-700 font-medium"
                    >
                      CPF *
                    </Label>
                    <Input
                      id="document"
                      placeholder="000.000.000-00"
                      value={customerData.document}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          document: e.target.value,
                        })
                      }
                      className="mt-1 border-gray-200 focus:border-gray-400"
                      maxLength={14}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Endereço de Entrega */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <MapPin className="h-5 w-5" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label
                        htmlFor="zipCode"
                        className="text-gray-700 font-medium"
                      >
                        CEP *
                      </Label>
                      <Input
                        id="zipCode"
                        placeholder="00000-000"
                        value={deliveryAddress.zipCode}
                        onChange={(e) => {
                          const value = e.target.value;
                          setDeliveryAddress({
                            ...deliveryAddress,
                            zipCode: value,
                          });
                          if (value.replace(/\D/g, '').length === 8) {
                            fetchAddressByCep(value);
                          }
                        }}
                        className="mt-1 border-gray-200 focus:border-gray-400"
                        maxLength={9}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label
                        htmlFor="street"
                        className="text-gray-700 font-medium"
                      >
                        Rua *
                      </Label>
                      <Input
                        id="street"
                        placeholder="Nome da rua"
                        value={deliveryAddress.street}
                        onChange={(e) =>
                          setDeliveryAddress({
                            ...deliveryAddress,
                            street: e.target.value,
                          })
                        }
                        className="mt-1 border-gray-200 focus:border-gray-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label
                        htmlFor="number"
                        className="text-gray-700 font-medium"
                      >
                        Número *
                      </Label>
                      <Input
                        id="number"
                        placeholder="123"
                        value={deliveryAddress.number}
                        onChange={(e) =>
                          setDeliveryAddress({
                            ...deliveryAddress,
                            number: e.target.value,
                          })
                        }
                        className="mt-1 border-gray-200 focus:border-gray-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label
                        htmlFor="complement"
                        className="text-gray-700 font-medium"
                      >
                        Complemento
                      </Label>
                      <Input
                        id="complement"
                        placeholder="Apto, casa, etc."
                        value={deliveryAddress.complement}
                        onChange={(e) =>
                          setDeliveryAddress({
                            ...deliveryAddress,
                            complement: e.target.value,
                          })
                        }
                        className="mt-1 border-gray-200 focus:border-gray-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label
                        htmlFor="neighborhood"
                        className="text-gray-700 font-medium"
                      >
                        Bairro *
                      </Label>
                      <Input
                        id="neighborhood"
                        placeholder="Nome do bairro"
                        value={deliveryAddress.neighborhood}
                        onChange={(e) =>
                          setDeliveryAddress({
                            ...deliveryAddress,
                            neighborhood: e.target.value,
                          })
                        }
                        className="mt-1 border-gray-200 focus:border-gray-400"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="city"
                        className="text-gray-700 font-medium"
                      >
                        Cidade *
                      </Label>
                      <Input
                        id="city"
                        placeholder="Nome da cidade"
                        value={deliveryAddress.city}
                        onChange={(e) =>
                          setDeliveryAddress({
                            ...deliveryAddress,
                            city: e.target.value,
                          })
                        }
                        className="mt-1 border-gray-200 focus:border-gray-400"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="state"
                        className="text-gray-700 font-medium"
                      >
                        Estado *
                      </Label>
                      <Input
                        id="state"
                        placeholder="SP"
                        value={deliveryAddress.state}
                        onChange={(e) =>
                          setDeliveryAddress({
                            ...deliveryAddress,
                            state: e.target.value,
                          })
                        }
                        className="mt-1 border-gray-200 focus:border-gray-400"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Observações do Pedido */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Package className="h-5 w-5" />
                    Observações do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="notes" className="text-gray-700 font-medium">
                    Informações adicionais (opcional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Alguma informação especial sobre a entrega..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="mt-1 border-gray-200 focus:border-gray-400 h-20"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {orderNotes.length}/500 caracteres
                  </p>
                </CardContent>
              </Card>

              {/* Termos e Condições */}
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 text-gray-900 rounded border-gray-300"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700">
                        Aceito os{' '}
                        <Link
                          href="/termos"
                          className="text-gray-900 underline hover:text-gray-700"
                        >
                          termos de uso
                        </Link>{' '}
                        e{' '}
                        <Link
                          href="/condicoes"
                          className="text-gray-900 underline hover:text-gray-700"
                        >
                          condições de venda
                        </Link>
                        *
                      </label>
                    </div>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="privacy"
                        checked={acceptedPrivacy}
                        onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                        className="mt-1 h-4 w-4 text-gray-900 rounded border-gray-300"
                      />
                      <label
                        htmlFor="privacy"
                        className="text-sm text-gray-700"
                      >
                        Aceito a{' '}
                        <Link
                          href="/privacidade"
                          className="text-gray-900 underline hover:text-gray-700"
                        >
                          política de privacidade
                        </Link>
                        *
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumo do Pedido */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-gray-900">
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Produtos */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">
                      Produtos ({totalItems}{' '}
                      {totalItems === 1 ? 'item' : 'itens'})
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm text-gray-900 truncate">
                              {item.title}
                            </h5>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs border-gray-300 text-gray-700"
                              >
                                <Tag className="w-2 h-2 mr-1" />
                                {item.size}
                              </Badge>
                              {item.customization &&
                                (item.customization.name ||
                                  item.customization.number) && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-gray-300 text-gray-700"
                                  >
                                    <Palette className="w-2 h-2 mr-1" />
                                    Custom
                                  </Badge>
                                )}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-gray-600">
                                Qtd: {item.quantity}
                              </span>
                              <span className="font-semibold text-sm text-gray-900">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Totais */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal produtos:</span>
                      <span className="font-medium text-gray-900">
                        {formatPrice(baseSubtotal)}
                      </span>
                    </div>

                    {totalCustomizationFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Palette className="w-3 h-3" />
                          Personalização:
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(totalCustomizationFee)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        Frete:
                      </span>
                      <span className="font-medium text-gray-900">
                        {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">
                        {formatPrice(total)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 text-center">
                      ou 3x de {formatPrice(total / 3)} sem juros
                    </p>
                  </div>

                  <Separator />

                  {/* Entrega */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Entrega
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span>Prazo: 5-7 dias úteis</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>Rastreamento disponível</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Botão de Pagamento */}
                  <div className="space-y-4">
                    <Button
                      onClick={processPayment}
                      disabled={processingPayment || cartItems.length === 0}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 text-lg font-semibold disabled:opacity-50"
                    >
                      {processingPayment ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5 mr-2" />
                          Pagar com Mercado Pago
                        </>
                      )}
                    </Button>

                    {/* Segurança */}
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <Shield className="w-4 h-4" />
                      <span>Pagamento 100% seguro</span>
                    </div>

                    {/* Métodos de pagamento */}
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-2">
                        Métodos de pagamento:
                      </p>
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-xs border-gray-300"
                        >
                          PIX
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs border-gray-300"
                        >
                          Cartão
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs border-gray-300"
                        >
                          Boleto
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

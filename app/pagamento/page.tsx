'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
import {
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Shield,
  Truck,
  MapPin,
  User,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
  customization?: {
    name?: string;
    number?: string;
  };
}

interface FormData {
  // Dados pessoais
  name: string;
  surname: string;
  email: string;
  phone: string;
  document: string;

  // Endereço
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export default function PagamentoPage() {
  const { user, isLoaded } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    document: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  // Carregar dados do usuário logado
  useEffect(() => {
    if (isLoaded && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.firstName || '',
        surname: user.lastName || '',
        email: user.primaryEmailAddress?.emailAddress || '',
        phone: user.primaryPhoneNumber?.phoneNumber || '',
      }));

      // Carregar endereço salvo do usuário
      loadUserAddress();
    }
  }, [isLoaded, user]);

  // Carregar endereço salvo
  const loadUserAddress = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/user/address');
      if (response.ok) {
        const data = await response.json();
        if (data.address) {
          setFormData((prev) => ({
            ...prev,
            zipCode: data.address.zipCode || '',
            street: data.address.street || '',
            number: data.address.number || '',
            complement: data.address.complement || '',
            neighborhood: data.address.neighborhood || '',
            city: data.address.city || '',
            state: data.address.state || '',
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar endereço:', error);
    }
  };

  // Carregar itens do carrinho
  useEffect(() => {
    const loadCart = () => {
      try {
        if (typeof window === 'undefined') return;

        const cartData = localStorage.getItem('cart');
        if (!cartData) {
          setCartItems([]);
          return;
        }

        const parsedCart = JSON.parse(cartData);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        setCartItems([]);
        toast.error('Erro ao carregar carrinho');
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Calcular totais com a tabela de frete correta
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Aplicar tabela de frete baseada na quantidade total de camisas
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const calculateShipping = (quantity: number) => {
    if (quantity >= 4) return 0; // 4+ camisas: Grátis
    if (quantity === 3) return 15; // 3 camisas: R$ 15,00
    if (quantity === 2) return 20; // 2 camisas: R$ 20,00
    if (quantity === 1) return 25; // 1 camisa: R$ 25,00
    return 0; // Carrinho vazio
  };

  const shipping = calculateShipping(totalQuantity);
  const total = subtotal + shipping;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Formatações melhoradas
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      if (cleaned.length === 11) {
        const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
        if (match) {
          return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
      } else if (cleaned.length === 10) {
        const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
        if (match) {
          return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
      }
    }
    return value;
  };

  const formatDocument = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      if (cleaned.length === 11) {
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
        if (match) {
          return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
        }
      }
    }
    return value;
  };

  const formatZipCode = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 8) {
      if (cleaned.length === 8) {
        const match = cleaned.match(/^(\d{5})(\d{3})$/);
        if (match) {
          return `${match[1]}-${match[2]}`;
        }
      }
    }
    return value;
  };

  // Validar CPF
  const isValidCPF = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return false;

    // Verificar sequência repetida
    if (/^(\d)\1{10}$/.test(cleaned)) return false;

    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(10))) return false;

    return true;
  };

  // Implementar função handleDocumentChange
  const handleDocumentChange = (value: string) => {
    const formatted = formatDocument(value);
    handleInputChange('document', formatted);
  };

  // Buscar CEP melhorado
  const searchZipCode = async (zipCode: string) => {
    const cleaned = zipCode.replace(/\D/g, '');
    if (cleaned.length === 8) {
      setAddressLoading(true);
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cleaned}/json/`,
        );
        const data = await response.json();

        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
          }));
          toast.success('CEP encontrado!');
        } else {
          toast.error('CEP não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast.error('Erro ao buscar CEP');
      } finally {
        setAddressLoading(false);
      }
    }
  };

  // Validação melhorada
  const getFormErrors = () => {
    const errors: string[] = [];

    if (!formData.name.trim()) errors.push('Nome é obrigatório');
    if (!formData.email.trim()) errors.push('Email é obrigatório');
    if (!formData.phone.trim()) errors.push('Telefone é obrigatório');
    if (!formData.document.trim()) errors.push('CPF é obrigatório'); // Agora obrigatório
    if (!formData.zipCode.trim()) errors.push('CEP é obrigatório');
    if (!formData.street.trim()) errors.push('Rua é obrigatória');
    if (!formData.number.trim()) errors.push('Número é obrigatório');
    if (!formData.neighborhood.trim()) errors.push('Bairro é obrigatório');
    if (!formData.city.trim()) errors.push('Cidade é obrigatória');
    if (!formData.state.trim()) errors.push('Estado é obrigatório');

    // Validações específicas
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Email inválido');
    }

    if (formData.document && !isValidCPF(formData.document)) {
      errors.push('CPF inválido');
    }

    if (formData.zipCode && formData.zipCode.replace(/\D/g, '').length !== 8) {
      errors.push('CEP inválido');
    }

    return errors;
  };

  const isFormValid = () => getFormErrors().length === 0;

  // Salvar endereço do usuário
  const saveUserAddress = async () => {
    if (!user) return;

    try {
      await fetch('/api/user/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: {
            zipCode: formData.zipCode,
            street: formData.street,
            number: formData.number,
            complement: formData.complement,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
          },
        }),
      });
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
    }
  };

  // Finalizar pedido melhorado
  const handleCheckout = async () => {
    const errors = getFormErrors();
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }

    setSubmitting(true);

    try {
      // Salvar endereço se usuário logado
      if (user) {
        await saveUserAddress();
      }

      const checkoutData = {
        items: cartItems,
        customerInfo: {
          clerkId: user?.id || null,
          name: `${formData.name} ${formData.surname}`.trim(),
          email: formData.email,
          phone: formData.phone,
          document: formData.document,
        },
        shippingAddress: {
          zipCode: formData.zipCode,
          street: formData.street,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
        },
        totals: {
          subtotal,
          shipping,
          total,
        },
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData),
      });

      const result = await response.json();

      if (result.success) {
        // Salvar dados do pedido no localStorage temporariamente
        localStorage.setItem(
          'lastOrder',
          JSON.stringify({
            orderNumber: result.orderNumber,
            items: cartItems,
            total,
            customerInfo: checkoutData.customerInfo,
            shippingAddress: checkoutData.shippingAddress,
            preferenceId: result.preferenceId,
          }),
        );

        // Limpar carrinho
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));

        // Redirecionar para Mercado Pago
        if (result.initPoint) {
          window.location.href = result.initPoint;
        } else {
          // Se não houver link de pagamento, redirecionar para página de sucesso
          router.push(`/pedido/sucesso?order=${result.orderNumber}`);
        }
      } else {
        toast.error(result.error || 'Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      toast.error('Erro interno do servidor');
    } finally {
      setSubmitting(false);
    }
  };

  // Estados de loading
  if (!isLoaded || loading) {
    return <CheckoutSkeleton />;
  }

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary-900">
                Finalizar Compra
              </h1>
              <p className="text-gray-600 mt-1">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}{' '}
                no seu pedido
              </p>
            </div>
            <Link href="/carrinho">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Carrinho
              </Button>
            </Link>
          </div>

          {/* Login prompt para usuários não logados */}
          {!user && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">
                    Faça login para uma experiência melhor
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Salve seus dados, acompanhe pedidos e tenha acesso a ofertas
                    exclusivas.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 mt-2"
                  >
                    Fazer Login
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulário */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dados Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Dados Pessoais
                    {user && (
                      <span className="ml-auto text-sm font-normal text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Logado como {user.firstName}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange('name', e.target.value)
                        }
                        placeholder="Seu nome"
                        disabled={!!user?.firstName}
                      />
                    </div>
                    <div>
                      <Label htmlFor="surname">Sobrenome</Label>
                      <Input
                        id="surname"
                        value={formData.surname}
                        onChange={(e) =>
                          handleInputChange('surname', e.target.value)
                        }
                        placeholder="Seu sobrenome"
                        disabled={!!user?.lastName}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange('email', e.target.value)
                          }
                          placeholder="seu@email.com"
                          className="pl-10"
                          disabled={!!user?.primaryEmailAddress}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange(
                              'phone',
                              formatPhone(e.target.value),
                            )
                          }
                          placeholder="(11) 99999-9999"
                          className="pl-10"
                          maxLength={15}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="document"
                        className="flex items-center gap-1"
                      >
                        CPF
                        <span className="text-red-500">*</span>
                        {formData.document && isValidCPF(formData.document) && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="document"
                          value={formData.document}
                          onChange={(e) => handleDocumentChange(e.target.value)}
                          placeholder="000.000.000-00"
                          className={`pl-10 ${
                            formData.document && !isValidCPF(formData.document)
                              ? 'border-red-500 focus:border-red-500'
                              : formData.document &&
                                isValidCPF(formData.document)
                              ? 'border-green-500 focus:border-green-500'
                              : ''
                          }`}
                          maxLength={14}
                          required
                        />
                      </div>
                      {formData.document && !isValidCPF(formData.document) && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          CPF inválido
                        </p>
                      )}
                      {formData.document && isValidCPF(formData.document) && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          CPF válido
                        </p>
                      )}
                      {!formData.document && (
                        <p className="text-xs text-gray-500 mt-1">
                          CPF é obrigatório para finalizar a compra
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Endereço */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço de Entrega
                    {addressLoading && (
                      <Loader2 className="w-4 h-4 animate-spin ml-auto" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="zipCode">CEP *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => {
                          const formatted = formatZipCode(e.target.value);
                          handleInputChange('zipCode', formatted);
                          if (formatted.length === 9) {
                            searchZipCode(formatted);
                          }
                        }}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="street">Rua/Avenida *</Label>
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) =>
                          handleInputChange('street', e.target.value)
                        }
                        placeholder="Nome da rua"
                        disabled={addressLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="number">Número *</Label>
                      <Input
                        id="number"
                        value={formData.number}
                        onChange={(e) =>
                          handleInputChange('number', e.target.value)
                        }
                        placeholder="123"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        value={formData.complement}
                        onChange={(e) =>
                          handleInputChange('complement', e.target.value)
                        }
                        placeholder="Apartamento, bloco, etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="neighborhood">Bairro *</Label>
                      <Input
                        id="neighborhood"
                        value={formData.neighborhood}
                        onChange={(e) =>
                          handleInputChange('neighborhood', e.target.value)
                        }
                        placeholder="Nome do bairro"
                        disabled={addressLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange('city', e.target.value)
                        }
                        placeholder="Nome da cidade"
                        disabled={addressLoading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado *</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) =>
                          handleInputChange('state', value)
                        }
                        disabled={addressLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AC">AC - Acre</SelectItem>
                          <SelectItem value="AL">AL - Alagoas</SelectItem>
                          <SelectItem value="AP">AP - Amapá</SelectItem>
                          <SelectItem value="AM">AM - Amazonas</SelectItem>
                          <SelectItem value="BA">BA - Bahia</SelectItem>
                          <SelectItem value="CE">CE - Ceará</SelectItem>
                          <SelectItem value="DF">
                            DF - Distrito Federal
                          </SelectItem>
                          <SelectItem value="ES">
                            ES - Espírito Santo
                          </SelectItem>
                          <SelectItem value="GO">GO - Goiás</SelectItem>
                          <SelectItem value="MA">MA - Maranhão</SelectItem>
                          <SelectItem value="MT">MT - Mato Grosso</SelectItem>
                          <SelectItem value="MS">
                            MS - Mato Grosso do Sul
                          </SelectItem>
                          <SelectItem value="MG">MG - Minas Gerais</SelectItem>
                          <SelectItem value="PA">PA - Pará</SelectItem>
                          <SelectItem value="PB">PB - Paraíba</SelectItem>
                          <SelectItem value="PR">PR - Paraná</SelectItem>
                          <SelectItem value="PE">PE - Pernambuco</SelectItem>
                          <SelectItem value="PI">PI - Piauí</SelectItem>
                          <SelectItem value="RJ">
                            RJ - Rio de Janeiro
                          </SelectItem>
                          <SelectItem value="RN">
                            RN - Rio Grande do Norte
                          </SelectItem>
                          <SelectItem value="RS">
                            RS - Rio Grande do Sul
                          </SelectItem>
                          <SelectItem value="RO">RO - Rondônia</SelectItem>
                          <SelectItem value="RR">RR - Roraima</SelectItem>
                          <SelectItem value="SC">
                            SC - Santa Catarina
                          </SelectItem>
                          <SelectItem value="SP">SP - São Paulo</SelectItem>
                          <SelectItem value="SE">SE - Sergipe</SelectItem>
                          <SelectItem value="TO">TO - Tocantins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumo */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Lista de Itens */}
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div
                        key={`${item.id}-${item.size}`}
                        className="flex gap-3"
                      >
                        <div className="relative w-16 h-16 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-600">
                            Tamanho: {item.size} • Qtd: {item.quantity}
                          </p>
                          {item.customization?.name && (
                            <p className="text-xs text-gray-600">
                              Nome: {item.customization.name}
                            </p>
                          )}
                          {item.customization?.number && (
                            <p className="text-xs text-gray-600">
                              Número: {item.customization.number}
                            </p>
                          )}
                          <p className="text-sm font-semibold mt-1">
                            R${' '}
                            {(item.price * item.quantity)
                              .toFixed(2)
                              .replace('.', ',')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totais Atualizados */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        Frete ({totalQuantity}{' '}
                        {totalQuantity === 1 ? 'item' : 'itens'})
                      </span>
                      <span
                        className={
                          shipping === 0 ? 'text-green-600 font-medium' : ''
                        }
                      >
                        {shipping === 0
                          ? 'Grátis!'
                          : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                      </span>
                    </div>

                    {/* Tabela de frete informativa */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Tabela de Frete:
                      </p>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div
                          className={`flex justify-between ${
                            totalQuantity === 1
                              ? 'font-semibold text-primary-600'
                              : ''
                          }`}
                        >
                          <span>1 camisa:</span>
                          <span>R$ 25,00</span>
                        </div>
                        <div
                          className={`flex justify-between ${
                            totalQuantity === 2
                              ? 'font-semibold text-primary-600'
                              : ''
                          }`}
                        >
                          <span>2 camisas:</span>
                          <span>R$ 20,00</span>
                        </div>
                        <div
                          className={`flex justify-between ${
                            totalQuantity === 3
                              ? 'font-semibold text-primary-600'
                              : ''
                          }`}
                        >
                          <span>3 camisas:</span>
                          <span>R$ 15,00</span>
                        </div>
                        <div
                          className={`flex justify-between ${
                            totalQuantity >= 4
                              ? 'font-semibold text-green-600'
                              : ''
                          }`}
                        >
                          <span>4+ camisas:</span>
                          <span>Grátis!</span>
                        </div>
                      </div>

                      {/* Incentivo para próximo desconto */}
                      {totalQuantity < 4 && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-700">
                            {totalQuantity === 3 ? (
                              <span>
                                <strong>Adicione +1 camisa</strong> e ganhe
                                frete grátis!
                              </span>
                            ) : totalQuantity === 2 ? (
                              <span>
                                <strong>Adicione +2 camisas</strong> e ganhe
                                frete grátis!
                              </span>
                            ) : (
                              <span>
                                <strong>Adicione +3 camisas</strong> e ganhe
                                frete grátis!
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary-600">
                        R$ {total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Método de Pagamento */}
                  <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-primary-600" />
                      <span className="font-medium text-primary-900">
                        Mercado Pago
                      </span>
                    </div>
                    <p className="text-xs text-primary-700">
                      PIX, Cartão, Boleto e muito mais
                    </p>
                  </div>

                  {/* Botão Finalizar */}
                  <Button
                    onClick={handleCheckout}
                    disabled={submitting || !isFormValid()}
                    className="w-full mt-6 bg-primary-800 hover:bg-primary-700 h-12 text-lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Ir para Pagamento
                      </>
                    )}
                  </Button>

                  {/* Erros de validação */}
                  {!isFormValid() && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            Verifique os campos obrigatórios:
                          </p>
                          <ul className="text-xs text-red-700 mt-1">
                            {getFormErrors()
                              .slice(0, 3)
                              .map((error, index) => (
                                <li key={index}>• {error}</li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Segurança */}
                  <div className="flex items-center justify-center gap-1 mt-4 text-xs text-gray-500">
                    <Shield className="h-3 w-3" />
                    <span>Compra 100% segura e protegida</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Componente de Loading
function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de Carrinho Vazio
function EmptyCart() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-xl shadow-sm p-12">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Carrinho Vazio
            </h2>
            <p className="text-gray-600 mb-8">
              Não há itens para finalizar a compra. Adicione produtos ao seu
              carrinho primeiro.
            </p>
            <div className="space-y-4">
              <Link href="/">
                <Button className="bg-primary-800 hover:bg-primary-700">
                  Ir às Compras
                </Button>
              </Link>
              <br />
              <Link href="/carrinho">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Carrinho
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

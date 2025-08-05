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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
      } finally {
        setLoading(false);
      }
    };

    setTimeout(loadCart, 100);
  }, []);

  // Calcular totais
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = 0; // Frete grátis
  const total = subtotal + shipping;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Formatações
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    return value;
  };

  const formatDocument = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
      if (match) {
        return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
      }
    }
    return value;
  };

  const formatZipCode = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{5})(\d{3})$/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
    return value;
  };

  // Buscar CEP
  const searchZipCode = async (zipCode: string) => {
    if (zipCode.length === 9) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${zipCode.replace('-', '')}/json/`,
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
      }
    }
  };

  // Validação
  const isFormValid = () => {
    const required = [
      'name',
      'email',
      'phone',
      'document', // CPF agora é obrigatório
      'zipCode',
      'street',
      'number',
      'city',
      'state',
    ];
    return required.every(
      (field) => formData[field as keyof FormData].trim() !== '',
    );
  };

  // Finalizar pedido
  const handleCheckout = async () => {
    if (!isFormValid()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }

    setSubmitting(true);

    try {
      const checkoutData = {
        items: cartItems,
        payer: {
          name: formData.name,
          surname: formData.surname,
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
            items: cartItems,
            total,
            payer: checkoutData.payer,
            shippingAddress: checkoutData.shippingAddress,
            preferenceId: result.preferenceId,
          }),
        );

        // Limpar carrinho
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));

        // Redirecionar para Mercado Pago
        window.location.href = result.initPoint;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
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
                  <Button className="bg-blue-600 hover:bg-blue-700">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulário */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dados Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Dados Pessoais
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
                      <Label htmlFor="document">CPF *</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="document"
                          value={formData.document}
                          onChange={(e) =>
                            handleInputChange(
                              'document',
                              formatDocument(e.target.value),
                            )
                          }
                          placeholder="000.000.000-00"
                          className="pl-10"
                          maxLength={14}
                        />
                      </div>
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
                          searchZipCode(formatted);
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado *</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) =>
                          handleInputChange('state', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="AL">AL</SelectItem>
                          <SelectItem value="AP">AP</SelectItem>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="BA">BA</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                          <SelectItem value="DF">DF</SelectItem>
                          <SelectItem value="ES">ES</SelectItem>
                          <SelectItem value="GO">GO</SelectItem>
                          <SelectItem value="MA">MA</SelectItem>
                          <SelectItem value="MT">MT</SelectItem>
                          <SelectItem value="MS">MS</SelectItem>
                          <SelectItem value="MG">MG</SelectItem>
                          <SelectItem value="PA">PA</SelectItem>
                          <SelectItem value="PB">PB</SelectItem>
                          <SelectItem value="PR">PR</SelectItem>
                          <SelectItem value="PE">PE</SelectItem>
                          <SelectItem value="PI">PI</SelectItem>
                          <SelectItem value="RJ">RJ</SelectItem>
                          <SelectItem value="RN">RN</SelectItem>
                          <SelectItem value="RS">RS</SelectItem>
                          <SelectItem value="RO">RO</SelectItem>
                          <SelectItem value="RR">RR</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="SP">SP</SelectItem>
                          <SelectItem value="SE">SE</SelectItem>
                          <SelectItem value="TO">TO</SelectItem>
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
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 rounded bg-gray-100 overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.title}</h4>
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
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totais */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        Frete
                      </span>
                      <span className="text-green-600 font-medium">Grátis</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-blue-600">
                        R$ {total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Método de Pagamento */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        Mercado Pago
                      </span>
                    </div>
                    <p className="text-xs text-blue-700">
                      PIX, Cartão, Boleto e muito mais
                    </p>
                  </div>

                  {/* Botão Finalizar */}
                  <Button
                    onClick={handleCheckout}
                    disabled={submitting || !isFormValid()}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Ir para Pagamento
                      </>
                    )}
                  </Button>

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

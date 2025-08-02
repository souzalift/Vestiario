'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { CreditCard, Truck, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CheckoutPage() {
  const { state, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    email: '',
    name: '',
    document: '',
    phone: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setCustomerData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setCustomerData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleCheckout = async () => {
    if (!customerData.email || !customerData.name) {
      toast.error('Por favor, preencha os campos obrigatórios');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: state.items,
          payer: {
            email: customerData.email,
            name: customerData.name,
            identification: {
              type: 'CPF',
              number: customerData.document,
            },
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Clear cart and redirect to Mercado Pago
        clearCart();
        window.location.href = data.initPoint;
      } else {
        toast.error('Erro ao processar pagamento. Tente novamente.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Carrinho vazio</h1>
            <p className="text-gray-600 mb-8">Adicione produtos ao carrinho para finalizar a compra.</p>
            <Link href="/">
              <Button>Continuar Comprando</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={customerData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="document">CPF</Label>
                      <Input
                        id="document"
                        value={customerData.document}
                        onChange={(e) => handleInputChange('document', e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={customerData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endereço de Entrega</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        value={customerData.address.zipCode}
                        onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                        placeholder="00000-000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="street">Rua</Label>
                      <Input
                        id="street"
                        value={customerData.address.street}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        placeholder="Nome da rua"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        value={customerData.address.number}
                        onChange={(e) => handleInputChange('address.number', e.target.value)}
                        placeholder="123"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        value={customerData.address.complement}
                        onChange={(e) => handleInputChange('address.complement', e.target.value)}
                        placeholder="Apartamento, bloco, etc."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={customerData.address.neighborhood}
                        onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
                        placeholder="Seu bairro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={customerData.address.city}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        placeholder="Sua cidade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={customerData.address.state}
                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                        placeholder="SP"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <p className="text-xs text-gray-600">
                            {item.size} • Qtd: {item.quantity}
                          </p>
                          {(item.customization.name || item.customization.number) && (
                            <p className="text-xs text-gray-600">
                              {item.customization.name && item.customization.name}
                              {item.customization.name && item.customization.number && ' • '}
                              {item.customization.number && `Nº ${item.customization.number}`}
                            </p>
                          )}
                        </div>
                        <div className="text-sm font-medium">
                          R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                    ))}
                    
                    <hr />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>R$ {state.total.toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frete</span>
                        <span className="text-green-600">Grátis</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold pt-2">
                        <span>Total</span>
                        <span className="text-blue-600">R$ {state.total.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Método de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>Mercado Pago</strong>
                    </p>
                    <p className="text-xs text-blue-600">
                      Pague com cartão de crédito, débito, PIX ou boleto bancário
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Security Info */}
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Compra Segura</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4" />
                  <span>Frete Grátis</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
              >
                {loading ? 'Processando...' : 'Ir para Pagamento'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
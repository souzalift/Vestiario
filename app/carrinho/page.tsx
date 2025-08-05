'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Truck,
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

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Carregar itens do carrinho
  useEffect(() => {
    const loadCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Salvar carrinho no localStorage
  const saveCart = (items: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(items));
    setCartItems(items);
    // Disparar evento para atualizar contador
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Atualizar quantidade
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedItems = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item,
    );
    saveCart(updatedItems);
    toast.success('Quantidade atualizada!');
  };

  // Remover item
  const removeItem = (itemId: string) => {
    const updatedItems = cartItems.filter((item) => item.id !== itemId);
    saveCart(updatedItems);
    toast.success('Camisa removida do carrinho!');
  };

  // Limpar carrinho
  const clearCart = () => {
    saveCart([]);
    toast.success('Carrinho limpo!');
  };

  // Calcular total de itens (quantidade total)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Calcular frete baseado na quantidade total de itens
  const calculateShipping = (itemCount: number) => {
    if (itemCount === 0) return 0;
    if (itemCount === 1) return 25;
    if (itemCount === 2) return 20;
    if (itemCount === 3) return 15;
    return 0; // 4+ itens = frete grátis
  };

  // Calcular totais
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = calculateShipping(totalItems);
  const total = subtotal + shipping;

  // Função para determinar a cor e texto do frete
  const getShippingInfo = () => {
    if (totalItems === 0) return { color: 'text-gray-600', text: 'Calcular' };
    if (totalItems >= 4) return { color: 'text-green-600', text: 'Grátis' };
    return { color: 'text-gray-900', text: `R$ ${shipping.toFixed(2)}` };
  };

  // Calcular quantos itens faltam para frete grátis
  const itemsToFreeShipping = Math.max(0, 4 - totalItems);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
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
                Seu carrinho está vazio
              </h2>
              <p className="text-gray-600 mb-8">
                Adicione algumas camisas incríveis ao seu carrinho para
                continuar
              </p>
              <Link href="/">
                <Button className="bg-primary hover:bg-primary-dark">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continuar Comprando
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const shippingInfo = getShippingInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Carrinho de Compras
              </h1>
              <p className="text-gray-600 mt-1">
                {totalItems} {totalItems === 1 ? 'camisa' : 'camisas'} no seu
                carrinho
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continuar Comprando
              </Button>
            </Link>
          </div>

          {/* Aviso de frete grátis */}
          {totalItems > 0 && totalItems < 4 && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-blue-800 font-medium">
                      Falta{totalItems < 3 ? 'm' : ''} apenas{' '}
                      {itemsToFreeShipping}{' '}
                      {itemsToFreeShipping === 1 ? 'camisa' : 'camisas'} para
                      ganhar <span className="font-bold">frete grátis!</span>
                    </p>
                    <p className="text-blue-600 text-sm">
                      Economize R$ {shipping.toFixed(2)} adicionando mais{' '}
                      {itemsToFreeShipping}{' '}
                      {itemsToFreeShipping === 1 ? 'camisa' : 'camisas'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {item.title}
                          </h3>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                          <p>
                            Tamanho:{' '}
                            <span className="font-medium">{item.size}</span>
                          </p>
                          {item.customization?.name && (
                            <p>
                              Nome:{' '}
                              <span className="font-medium">
                                {item.customization.name}
                              </span>
                            </p>
                          )}
                          {item.customization?.number && (
                            <p>
                              Número:{' '}
                              <span className="font-medium">
                                {item.customization.number}
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              R$ {(item.price * item.quantity).toFixed(2)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-gray-600">
                                R$ {item.price.toFixed(2)} cada
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Clear Cart */}
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Carrinho
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Resumo do Pedido
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>
                        Subtotal ({totalItems}{' '}
                        {totalItems === 1 ? 'camisa' : 'camisas'})
                      </span>
                      <span>R$ {subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        Frete
                      </span>
                      <span className={shippingInfo.color}>
                        {shippingInfo.text}
                      </span>
                    </div>

                    {/* Info sobre frete */}
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Tabela de Frete:</p>
                      <p>• 1 camisa: R$ 25,00</p>
                      <p>• 2 camisas: R$ 20,00</p>
                      <p>• 3 camisas: R$ 15,00</p>
                      <p>
                        • 4+ camisas:{' '}
                        <span className="text-green-600 font-medium">
                          Grátis!
                        </span>
                      </p>
                    </div>

                    <hr />

                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 mb-3"
                    onClick={() => router.push('/pagamento')}
                  >
                    Finalizar Compra
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Compra 100% segura e protegida
                  </p>
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

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Truck,
  Palette,
  Tag,
  Package,
  Shield,
  Heart,
} from 'lucide-react';
import { toast } from 'sonner';
import { calculateShipping, getNextShippingDiscount } from '@/lib/shipping';
import { useCart } from '@/contexts/CartContext';

interface CartItem {
  id: string;
  productId: string;
  productSlug?: string;
  title: string;
  price: number;
  basePrice?: number;
  customizationFee?: number;
  image: string;
  size: string;
  quantity: number;
  customization?: {
    name?: string;
    number?: string;
  } | null;
  category?: string;
  team?: string;
  brand?: string;
  addedAt?: string;
}

export default function CartPage() {
  const {
    items: cartItems,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getTotal,
  } = useCart();

  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Carregar favoritos
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(favs);
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Log do carrinho para debug
  useEffect(() => {
    console.log('🛒 Carrinho atualizado na página:', cartItems);
  }, [cartItems]);

  // Mover para favoritos
  const moveToFavorites = (item: CartItem) => {
    // Adicionar aos favoritos
    const newFavorites = [...favorites, item.productId];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));

    // Remover do carrinho
    removeItem(item.id);
    toast.success('Produto movido para favoritos!');
  };

  // Calcular totais
  const totalItems = getItemCount();
  const totalQuantity = totalItems;
  const shippingInfo = calculateShipping(totalQuantity);
  const nextDiscount = getNextShippingDiscount(totalQuantity);

  // Calcular totais
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

  // Função para determinar a cor e texto do frete
  const getShippingInfo = () => {
    if (totalItems === 0) return { color: 'text-gray-600', text: 'Calcular' };
    if (totalItems >= 4) return { color: 'text-gray-900', text: 'Grátis' };
    return { color: 'text-gray-900', text: `R$ ${shipping.toFixed(2)}` };
  };

  // Calcular quantos itens faltam para frete grátis
  const itemsToFreeShipping = Math.max(0, 4 - totalItems);

  // Formatação de preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 pt-20 pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-gray-300 rounded-lg"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Empty State
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Conteúdo centralizado verticalmente */}
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-sm p-12 max-w-lg w-full">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-12 w-12 text-gray-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Seu carrinho está vazio
                </h2>
                <p className="text-gray-600 mb-8">
                  Adicione algumas camisas incríveis ao seu carrinho para
                  continuar suas compras
                </p>
                <Link href="/">
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continuar Comprando
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Carrinho de Compras
              </h1>
              <p className="text-gray-600 mt-1">
                {totalItems} {totalItems === 1 ? 'produto' : 'produtos'} no seu
                carrinho
              </p>
            </div>
            <Link href="/">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continuar Comprando
              </Button>
            </Link>
          </div>

          {/* Aviso de frete grátis */}
          {totalItems > 0 && totalItems < 4 && (
            <div className="mb-8">
              <Card className="border border-gray-200 bg-gray-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Faltam apenas {itemsToFreeShipping}{' '}
                        {itemsToFreeShipping === 1 ? 'produto' : 'produtos'}{' '}
                        para{' '}
                        <span className="text-gray-900">frete grátis!</span>
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Economize {formatPrice(shipping)} adicionando mais{' '}
                        {itemsToFreeShipping}{' '}
                        {itemsToFreeShipping === 1 ? 'produto' : 'produtos'} ao
                        seu carrinho
                      </p>
                      {/* Barra de progresso */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(totalItems / 4) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {totalItems} de 4 produtos para frete grátis
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Image */}
                      <Link
                        href={`/produto/${item.productSlug || item.productId}`}
                      >
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 hover:opacity-80 transition-opacity cursor-pointer">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/produto/${
                                item.productSlug || item.productId
                              }`}
                              className="hover:text-gray-600 transition-colors"
                            >
                              <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-2 truncate">
                                {item.title}
                              </h3>
                            </Link>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge
                                variant="outline"
                                className="border-gray-300 text-gray-700 text-xs"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {item.size}
                              </Badge>
                              {item.category && (
                                <Badge
                                  variant="outline"
                                  className="border-gray-300 text-gray-700 text-xs"
                                >
                                  {item.category}
                                </Badge>
                              )}
                              {item.team && (
                                <Badge
                                  variant="outline"
                                  className="border-gray-300 text-gray-700 text-xs"
                                >
                                  {item.team}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => moveToFavorites(item)}
                              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Mover para favoritos"
                            >
                              <Heart className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remover do carrinho"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Customization */}
                        {item.customization &&
                          (item.customization.name ||
                            item.customization.number) && (
                            <div className="mb-3">
                              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg inline-block">
                                <div className="flex items-center gap-2 text-sm">
                                  <Palette className="w-4 h-4" />
                                  <span className="font-medium">
                                    Personalização:
                                  </span>
                                </div>
                                <div className="mt-1">
                                  {item.customization.name && (
                                    <div className="font-bold">
                                      {item.customization.name}
                                    </div>
                                  )}
                                  {item.customization.number && (
                                    <div className="text-lg font-bold">
                                      {item.customization.number}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 font-medium">
                              Qtd:
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-12 text-center font-semibold text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-sm text-gray-600">
                                {formatPrice(item.price)} cada
                              </p>
                            )}
                            {/* Breakdown de preço */}
                            {item.customizationFee &&
                              item.customizationFee > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  <div>
                                    Base:{' '}
                                    {formatPrice(
                                      (item.basePrice ||
                                        item.price - item.customizationFee) *
                                        item.quantity,
                                    )}
                                  </div>
                                  <div>
                                    Personalização:{' '}
                                    {formatPrice(
                                      item.customizationFee * item.quantity,
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Clear Cart */}
              {cartItems.length > 0 && (
                <div className="text-center pt-6">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Carrinho
                  </Button>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-6 text-gray-900">
                    Resumo do Pedido
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Produtos ({totalItems}{' '}
                        {totalItems === 1 ? 'item' : 'itens'})
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatPrice(baseSubtotal)}
                      </span>
                    </div>

                    {totalCustomizationFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Palette className="w-3 h-3" />
                          Personalização
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(totalCustomizationFee)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        Frete
                      </span>
                      <span
                        className={`font-medium ${getShippingInfo().color}`}
                      >
                        {getShippingInfo().text}
                      </span>
                    </div>

                    {/* Shipping Info Card */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Tabela de Frete:
                      </h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>1 produto:</span>
                          <span>R$ 25,00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>2 produtos:</span>
                          <span>R$ 20,00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>3 produtos:</span>
                          <span>R$ 15,00</span>
                        </div>
                        <div className="flex justify-between font-semibold text-gray-900">
                          <span>4+ produtos:</span>
                          <span>Grátis!</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between font-bold text-xl">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">
                          {formatPrice(total)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        ou 3x de {formatPrice(total / 3)} sem juros
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 text-lg font-semibold mb-4"
                    onClick={() => router.push('/checkout')}
                  >
                    Finalizar Compra
                  </Button>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Shield className="w-4 h-4" />
                    <span>Compra 100% segura e protegida</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

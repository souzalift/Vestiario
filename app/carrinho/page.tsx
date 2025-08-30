'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
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
  Heart,
  Frown,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import type { CartItem } from '@/contexts/CartContext';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

const FREE_SHIPPING_THRESHOLD = 4;
const MAX_CART_ITEMS = 7;

export default function CartPage() {
  const router = useRouter();

  const {
    items: cartItems,
    removeItem,
    updateQuantity,
    clearCart,
    cartCount,
    subtotal,
    shippingPrice,
    totalPrice,
    coupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [backupItems, setBackupItems] = useState<CartItem[]>([]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    const success = await applyCoupon(couponCode);
    if (!success) {
      toast.error('Cupom inválido ou expirado.');
    } else {
      toast.success('Cupom aplicado com sucesso!');
    }
    setIsApplyingCoupon(false);
  };

  const { addFavorite, isFavorite } = useFavorites();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const moveToFavorites = (item: CartItem) => {
    if (!isFavorite(item.productId)) {
      addFavorite(item.productId);
    }
    removeItem(item.id);
    toast.success('Produto movido para os favoritos!');
  };

  const handleRemove = (id: string) => {
    removeItem(id);
    toast.success('Produto removido do carrinho!');
  };

  const handleClearCart = () => {
    setBackupItems(cartItems); // salva para desfazer
    setIsClearing(true);
    clearCart();
    setIsClearing(false);

    toast.success('Carrinho limpo!', {
      action: {
        label: 'Desfazer',
        onClick: () => {
          backupItems.forEach((item) => {
            updateQuantity(item.id, item.quantity);
          });
        },
      },
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const itemsToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartCount);

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-gray-600" />
      </div>
    );
  }

  // Carrinho vazio
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="max-w-lg w-full text-center">
            <Card className="p-8 sm:p-12">
              <CardContent>
                <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-6">
                  <Frown className="h-12 w-12 text-gray-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Seu carrinho está no banco de reservas!
                </h2>
                <p className="text-gray-600 mb-8 text-sm sm:text-base">
                  Parece que ainda não escalou nenhum produto. Vá para o mercado
                  e faça umas contratações de peso para o seu guarda-roupa!
                </p>
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/#produtos">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Contratar Reforços
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Carrinho de Compras
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                {cartCount} {cartCount === 1 ? 'produto' : 'produtos'} no seu
                carrinho
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="sm:size-auto"
            >
              <Link href="/#produtos">
                <ArrowLeft className="h-4 w-4 mr-2" /> Continuar Comprando
              </Link>
            </Button>
          </div>

          {/* Frete grátis */}
          {cartCount > 0 && (
            <div className="mb-8">
              <Card className="bg-white">
                <CardContent className="items-center p-4 sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      {cartCount < FREE_SHIPPING_THRESHOLD ? (
                        <>
                          <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                            Faltam apenas {itemsToFreeShipping}{' '}
                            {itemsToFreeShipping === 1 ? 'produto' : 'produtos'}{' '}
                            para{' '}
                            <span className="text-green-600">
                              frete grátis!
                            </span>
                          </h3>
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gray-900 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (cartCount / FREE_SHIPPING_THRESHOLD) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {cartCount} de {FREE_SHIPPING_THRESHOLD} produtos
                            </p>
                          </div>
                        </>
                      ) : (
                        <h3 className="font-semibold text-green-700 mb-1">
                          🎉 Parabéns! Você ganhou frete grátis
                        </h3>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Lista de produtos */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <Link
                        href={`/produto/${item.productSlug || item.productId}`}
                        className="self-center sm:self-start"
                      >
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 mx-auto sm:mx-0">
                          <Image
                            src={item.image || '/images/placeholder.png'}
                            alt={`Produto: ${item.title} - Tamanho: ${item.size}`}
                            width={96}
                            height={96}
                            sizes="(max-width: 640px) 96px, 128px"
                            className="object-cover"
                          />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight mb-2 truncate">
                              {item.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline">
                                <Tag className="w-3 h-3 mr-1" />
                                {item.size}
                              </Badge>
                              {item.customization &&
                                (item.customization.name ||
                                  item.customization.number) && (
                                  <Badge variant="outline">
                                    <Palette className="w-3 h-3 mr-1" />
                                    Custom
                                  </Badge>
                                )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-2 sm:ml-4">
                            <button
                              onClick={() => moveToFavorites(item)}
                              className="p-2 text-gray-400 hover:text-gray-900"
                              aria-label="Mover para favoritos"
                            >
                              <Heart className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="p-2 text-gray-400 hover:text-red-600"
                              aria-label="Remover item"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  Math.max(1, item.quantity - 1),
                                )
                              }
                              disabled={item.quantity <= 1}
                              aria-label="Diminuir quantidade"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-10 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => {
                                if (cartCount >= MAX_CART_ITEMS) {
                                  toast.error(
                                    `Máximo de ${MAX_CART_ITEMS} itens permitido no carrinho.`,
                                  );
                                  return;
                                }
                                updateQuantity(item.id, item.quantity + 1);
                              }}
                              aria-label="Aumentar quantidade"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-lg sm:text-xl font-bold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs sm:text-sm text-gray-600">
                                {formatPrice(item.price)} cada
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {cartItems.length > 0 && (
                <div className="text-center pt-6">
                  <Button
                    variant="destructive"
                    onClick={handleClearCart}
                    disabled={isClearing}
                  >
                    {isClearing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpar Carrinho
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Resumo do pedido */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-6">
                    Resumo do Pedido
                  </h3>
                  {!coupon ? (
                    <div className="flex flex-col sm:flex-row gap-2 mb-6">
                      <Input
                        placeholder="Código do cupom"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                      >
                        {isApplyingCoupon ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Aplicar'
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-green-800 flex items-center gap-2">
                          <Tag className="w-4 h-4" /> Cupom "{coupon.code}"
                          aplicado!
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={removeCoupon}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Desconto</span>
                        <span>- {formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Frete</span>
                      <span>
                        {shippingPrice === 0
                          ? 'Grátis'
                          : formatPrice(shippingPrice)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg sm:text-xl">
                      <span>Total</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="w-full text-lg"
                    onClick={() => {
                      setIsCheckingOut(true);
                      router.push('/checkout');
                    }}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Finalizar Compra'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

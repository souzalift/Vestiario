'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { IProduct } from '@/models/Product';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [customization, setCustomization] = useState({
    name: '',
    number: '',
  });

  useEffect(() => {
    if (params.slug) {
      fetchProduct(params.slug as string);
    }
  }, [params.slug]);

  const fetchProduct = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/products/${slug}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
      } else {
        setError(data.error || 'Produto não encontrado');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Erro ao carregar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!selectedSize) {
      toast.error('Por favor, selecione um tamanho');
      return;
    }

    try {
      setAddingToCart(true);

      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');

      const cartItem = {
        id: `${product.slug || product._id}-${selectedSize}-${
          customization.name
        }-${customization.number}`,
        title: product.title,
        price: product.price,
        image: product.image,
        size: selectedSize,
        customization,
        quantity: 1,
      };

      const existingItemIndex = existingCart.findIndex(
        (item: any) => item.id === cartItem.id,
      );

      if (existingItemIndex > -1) {
        existingCart[existingItemIndex].quantity += 1;
      } else {
        existingCart.push(cartItem);
      }

      localStorage.setItem('cart', JSON.stringify(existingCart));
      window.dispatchEvent(new Event('cartUpdated'));

      toast.success('Produto adicionado ao carrinho!');

      setTimeout(() => {
        router.push('/carrinho');
      }, 1000);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      toast.error('Erro ao adicionar produto ao carrinho');
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="mb-8">
                <div className="h-6 bg-gray-300 rounded w-48"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-gray-300 aspect-square rounded-lg"></div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="bg-gray-300 h-8 rounded w-3/4"></div>
                    <div className="bg-gray-300 h-6 rounded w-1/3"></div>
                  </div>
                  <div className="bg-gray-300 h-20 rounded"></div>
                  <div className="bg-gray-300 h-64 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {error || 'Produto não encontrado'}
              </h1>
              <p className="text-gray-600 mb-8">
                O produto que você está procurando não existe ou foi removido.
              </p>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para a loja
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para produtos
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden rounded-xl bg-white shadow-lg">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover transition-transform hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />

              {/* League Badge */}
              {product.league && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {product.league}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Product Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">
                    (4.8/5 - 124 avaliações)
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.title}
                </h1>

                {product.team && (
                  <p className="text-lg text-gray-600 mb-3">{product.team}</p>
                )}

                <p className="text-4xl font-bold text-green-600">
                  {formatPrice(product.price)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ou 3x de {formatPrice(product.price / 3)} sem juros
                </p>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed">
                {product.description}
              </p>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 space-y-6">
                  {/* Size Selection - Circular Buttons */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">
                      Tamanho
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes &&
                        product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`
                            w-16 h-16 rounded-full border-2 font-bold text-lg transition-all duration-200 hover:scale-110 active:scale-95
                            ${
                              selectedSize === size
                                ? 'border-blue-600 bg-blue-600 text-white shadow-lg transform scale-105'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                            }
                          `}
                          >
                            {size}
                          </button>
                        ))}
                    </div>
                    {!selectedSize && (
                      <p className="text-sm text-gray-500 mt-2">
                        Selecione um tamanho para continuar
                      </p>
                    )}
                  </div>

                  {/* Customization */}
                  <div>
                    <h3 className="text-base font-semibold mb-3">
                      Personalização (Opcional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="name"
                          className="text-sm font-medium text-gray-700"
                        >
                          Nome na camisa
                        </Label>
                        <Input
                          id="name"
                          placeholder="Ex: RONALDO"
                          value={customization.name}
                          onChange={(e) =>
                            setCustomization({
                              ...customization,
                              name: e.target.value.toUpperCase(),
                            })
                          }
                          className="mt-1 h-11"
                          maxLength={15}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Máximo 15 caracteres
                        </p>
                      </div>
                      <div>
                        <Label
                          htmlFor="number"
                          className="text-sm font-medium text-gray-700"
                        >
                          Número da camisa
                        </Label>
                        <Input
                          id="number"
                          placeholder="Ex: 7"
                          value={customization.number}
                          onChange={(e) =>
                            setCustomization({
                              ...customization,
                              number: e.target.value,
                            })
                          }
                          className="mt-1 h-11"
                          maxLength={2}
                          type="number"
                          min="1"
                          max="99"
                        />
                        <p className="text-xs text-gray-500 mt-1">De 1 a 99</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    disabled={addingToCart || !selectedSize}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {addingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Adicionando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Adicionar ao Carrinho
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Product Info */}
              <Card className="border-0 bg-gray-100">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 text-gray-900">
                    Informações do Produto
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      Material: 100% Poliéster com tecnologia Dri-FIT
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      Personalização incluída no preço
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      Tamanhos disponíveis:{' '}
                      {product.sizes?.join(', ') || 'P, M, G, GG, XGG'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      Entrega expressa em até 7 dias úteis
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      Garantia de qualidade e autenticidade
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      Troca grátis em até 30 dias
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';

// Sua interface IProduct aqui...
interface IProduct {
  _id: string; // Garanta que o _id sempre exista
  slug: string;
  title: string;
  description: string;
  price: number;
  images?: string[];
  league?: string;
  team?: string;
  sizes?: string[];
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart(); // Chame o hook diretamente. Se o provider não estiver lá, isso dará um erro claro, o que é bom para debug.

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
    const fetchProduct = async (slug: string) => {
      try {
        setLoading(true);
        setError(null);

        // A chamada à sua API para buscar o produto pelo slug
        const response = await fetch(`/api/products/${slug}`);
        if (!response.ok) {
          throw new Error('Produto não encontrado');
        }

        const data = await response.json();

        if (data.success) {
          setProduct(data.data);
          // Pré-seleciona o primeiro tamanho disponível, se houver
          if (data.data.sizes && data.data.sizes.length > 0) {
            setSelectedSize(data.data.sizes[0]);
          }
        } else {
          setError(data.error || 'Produto não encontrado');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar produto',
        );
      } finally {
        setLoading(false);
      }
    };

    // Verifica se o slug existe nos parâmetros da URL antes de buscar
    if (params.slug) {
      fetchProduct(params.slug as string);
    }
  }, [params.slug]); // Roda essa lógica sempre que o slug na URL mudar

  // A MUDANÇA PRINCIPAL ESTÁ AQUI
  const handleAddToCart = () => {
    if (!product) return;

    if (!selectedSize) {
      toast.error('Por favor, selecione um tamanho');
      return;
    }

    setAddingToCart(true);

    // 1. Prepare os dados para a função `addItem` do contexto
    const productData = {
      productId: product._id,
      productSlug: product.slug,
      title: product.title,
      basePrice: product.price, // O contexto calculará o preço final
      image: product.images?.[0] || '', // Envie apenas a primeira imagem
      team: product.team,
    };

    const options = {
      size: selectedSize,
      quantity: 1, // Adiciona 1 de cada vez
      customization:
        customization.name || customization.number ? customization : null,
      // Opcional: Se a personalização tiver um custo extra, calcule aqui
      customizationFee: 0,
    };

    // 2. Chame a função do contexto. É só isso!
    addItem(productData, options);

    // 3. Redirecione o usuário (o timeout é bom para UX)
    setTimeout(() => {
      setAddingToCart(false);
      router.push('/carrinho');
    }, 800); // 800ms é suficiente para o usuário ver o toast de sucesso
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
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              href="/#produtos"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para produtos
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden rounded-xl bg-white shadow-lg">
              {product.images &&
              product.images.length > 0 &&
              product.images[0].trim() !== '' ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                  Sem imagem
                </div>
              )}

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
                <div className="flex items-center gap-2 mb-2"></div>

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
                          <Button
                            key={size}
                            type="button"
                            variant={
                              selectedSize === size ? 'default' : 'outline'
                            }
                            className={`w-12 h-12  font-bold text-base transition-all duration-200 ${
                              selectedSize === size
                                ? 'border-blue-600 bg-blue-600 text-white shadow-lg scale-105'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                            onClick={() => setSelectedSize(size)}
                          >
                            {size}
                          </Button>
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
                    {(customization.name || customization.number) && (
                      <div className="mt-3 text-yellow-800 bg-yellow-100 border border-yellow-200 rounded px-3 py-2 text-sm font-semibold inline-block">
                        +R$ 20,00 serão adicionados ao valor do produto pela
                        personalização.
                      </div>
                    )}
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
                        <ShoppingCart className="h-5 w-5 mr-2 text-white" />
                        <p className="text-white">Adicionar ao Carrinho</p>
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

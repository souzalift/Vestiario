'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Heart,
  Eye,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  Info,
  Palette,
} from 'lucide-react';
import Link from 'next/link';
import { useViewTracker } from '@/hooks/useViewTracker';
import { ViewCounter } from '@/components/ViewCounter';

interface Product {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  price: number;
  category?: string;
  team?: string;
  brand?: string;
  season?: string;
  color?: string;
  material?: string;
  images: string[];
  sizes?: string[];
  tags?: string[];
  features?: string[];
  views?: number;
  rating?: number;
  reviewCount?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [customization, setCustomization] = useState({
    name: '',
    number: '',
  });

  // Constante para taxa de personalização
  const CUSTOMIZATION_FEE = 20.0;

  // Rastrear view automaticamente usando slug
  useViewTracker({
    productSlug: params.slug,
    enabled: !!product, // Só rastrear se o produto existir
    delay: 3000, // 3 segundos de delay
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
        setProduct(data.product || data.data);
        // Incrementar views
        incrementViews(slug);
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

  const incrementViews = async (slug: string) => {
    try {
      await fetch(`/api/products/${slug}/view`, { method: 'POST' });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  // Verificar se há personalização
  const hasCustomization = () => {
    return (
      customization.name.trim() !== '' || customization.number.trim() !== ''
    );
  };

  // Calcular preço total
  const calculateTotalPrice = () => {
    if (!product) return 0;
    const basePrice = product.price;
    const customizationPrice = hasCustomization() ? CUSTOMIZATION_FEE : 0;
    return basePrice + customizationPrice;
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (!selectedSize) {
      toast.error('Por favor, selecione um tamanho');
      return;
    }

    try {
      setAddingToCart(true);

      const finalPrice = calculateTotalPrice();
      const customizationData = hasCustomization() ? customization : null;

      // Gerar ID único mais limpo
      const customizationId = customizationData
        ? `${customizationData.name || ''}-${customizationData.number || ''}`
        : 'no-custom';

      const cartItemId = `${
        product.id
      }-${selectedSize}-${customizationId}-${Date.now()}`;

      const cartItem = {
        id: cartItemId,
        productId: product.id,
        productSlug: product.slug || product.id,
        title: product.title,
        price: finalPrice,
        basePrice: product.price,
        customizationFee: hasCustomization() ? CUSTOMIZATION_FEE : 0,
        image: product.images?.[0] || '',
        size: selectedSize,
        customization: customizationData,
        quantity: 1,
        category: product.category,
        team: product.team,
        brand: product.brand,
        addedAt: new Date().toISOString(),
      };

      console.log('🛒 Preparando item para carrinho:', cartItem);

      // Usar o contexto para adicionar
      addItem(cartItem);

      // Aguardar um pouco para garantir que foi salvo
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Redirecionar para o carrinho
      router.push('/carrinho');
    } catch (error) {
      console.error('❌ Erro ao adicionar ao carrinho:', error);
      toast.error('Erro ao adicionar produto ao carrinho');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!product?.images) return;

    const totalImages = product.images.length;
    if (direction === 'prev') {
      setSelectedImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    } else {
      setSelectedImageIndex((prev) => (prev + 1) % totalImages);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'fill-gray-900 text-gray-900'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Loading State
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
                <div className="bg-gray-300 aspect-square rounded-2xl"></div>
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

  // Error State
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <div className="text-6xl mb-4">😢</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {error || 'Produto não encontrado'}
              </h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                O produto que você está procurando não existe ou foi removido.
              </p>
              <Link href="/">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white">
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
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 pt-20 pb-12">
        {product && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Exemplo de onde usar o ViewCounter */}
            <div className="mb-6">
              <ViewCounter
                productSlug={params.slug}
                initialViews={product.views || 0}
                className="text-gray-500"
              />
            </div>

            {/* Breadcrumb */}
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para produtos
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Product Images */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-lg group">
                  {product.images && product.images.length > 0 ? (
                    <>
                      <Image
                        src={product.images[selectedImageIndex]}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                      />

                      {/* Navigation Arrows */}
                      {product.images.length > 1 && (
                        <>
                          <button
                            onClick={() => handleImageNavigation('prev')}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                          </button>
                          <button
                            onClick={() => handleImageNavigation('next')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                          </button>
                        </>
                      )}

                      {/* Image Counter */}
                      {product.images.length > 1 && (
                        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {selectedImageIndex + 1} / {product.images.length}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <div className="text-center">
                        <div className="text-6xl mb-2">⚽</div>
                        <p className="text-sm text-gray-500">Sem imagem</p>
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isFeatured && (
                      <Badge className="bg-gray-900 hover:bg-gray-800 text-white">
                        Destaque
                      </Badge>
                    )}
                    {product.category && (
                      <Badge
                        variant="secondary"
                        className="bg-white/90 text-gray-700"
                      >
                        {product.category}
                      </Badge>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isFavorite
                        ? 'bg-gray-900 text-white'
                        : 'bg-white/90 text-gray-600 hover:bg-gray-900 hover:text-white backdrop-blur-sm'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
                    />
                  </button>
                </div>

                {/* Thumbnail Images */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                          selectedImageIndex === index
                            ? 'ring-2 ring-gray-900 ring-offset-2'
                            : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.title} - ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                {/* Header */}
                <div>
                  {/* Rating */}
                  {product.rating && product.rating > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">{renderStars(product.rating)}</div>
                      <span className="text-sm text-gray-600 font-medium">
                        {product.rating.toFixed(1)} ({product.reviewCount || 0}{' '}
                        avaliações)
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Eye className="w-4 h-4" />
                        {product.views || 0} visualizações
                      </div>
                    </div>
                  )}

                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {product.title}
                  </h1>

                  {/* Team/Brand Info */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.team && (
                      <Badge
                        variant="outline"
                        className="border-gray-300 text-gray-700"
                      >
                        {product.team}
                      </Badge>
                    )}
                    {product.brand && (
                      <Badge
                        variant="outline"
                        className="border-gray-300 text-gray-700"
                      >
                        {product.brand}
                      </Badge>
                    )}
                    {product.season && (
                      <Badge
                        variant="outline"
                        className="border-gray-300 text-gray-700"
                      >
                        {product.season}
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-3">
                      <p className="text-4xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </p>
                      {hasCustomization() && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            + Personalização {formatPrice(CUSTOMIZATION_FEE)}
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            Total: {formatPrice(calculateTotalPrice())}
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      ou 3x de {formatPrice(calculateTotalPrice() / 3)} sem
                      juros
                    </p>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Características:
                    </h3>
                    <div className="space-y-2">
                      {product.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Purchase Options */}
                <Card className="border border-gray-200 shadow-sm">
                  <CardContent className="p-6 space-y-6">
                    {/* Size Selection */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div>
                        <Label className="text-base font-semibold mb-4 block text-gray-900">
                          Tamanho *
                        </Label>
                        <div className="flex flex-wrap gap-3">
                          {product.sizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`w-14 h-14 rounded-xl border-2 font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 ${
                                selectedSize === size
                                  ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                        {!selectedSize && (
                          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                            <Info className="w-4 h-4" />
                            Selecione um tamanho para continuar
                          </p>
                        )}
                      </div>
                    )}

                    {/* Customization */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                          <Palette className="w-5 h-5" />
                          Personalização
                        </h3>
                        <Badge
                          variant="outline"
                          className="border-gray-900 text-gray-900 font-semibold"
                        >
                          + {formatPrice(CUSTOMIZATION_FEE)}
                        </Badge>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <Info className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
                          <div>
                            <p className="font-medium mb-1">
                              Personalização opcional por{' '}
                              {formatPrice(CUSTOMIZATION_FEE)}
                            </p>
                            <p className="text-gray-600">
                              Adicione nome e/ou número para tornar sua camisa
                              única. A taxa será cobrada apenas se você
                              preencher algum campo.
                            </p>
                          </div>
                        </div>
                      </div>

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
                            className="mt-1 h-11 border-gray-200 focus:border-gray-400"
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
                            className="mt-1 h-11 border-gray-200 focus:border-gray-400"
                            maxLength={2}
                            type="number"
                            min="1"
                            max="99"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            De 1 a 99
                          </p>
                        </div>
                      </div>

                      {/* Customization Preview */}
                      {hasCustomization() && (
                        <div className="mt-4 p-4 bg-gray-900 text-white rounded-lg">
                          <div className="text-center">
                            <p className="text-sm text-gray-300 mb-2">
                              Prévia da personalização:
                            </p>
                            <div className="text-lg font-bold">
                              {customization.name && (
                                <div className="mb-1">{customization.name}</div>
                              )}
                              {customization.number && (
                                <div className="text-3xl font-bold">
                                  {customization.number}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Produto base:</span>
                          <span className="font-medium text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                        {hasCustomization() && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Personalização:
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatPrice(CUSTOMIZATION_FEE)}
                            </span>
                          </div>
                        )}
                        <div className="border-t border-gray-200 pt-2">
                          <div className="flex justify-between text-lg font-bold">
                            <span className="text-gray-900">Total:</span>
                            <span className="text-gray-900">
                              {formatPrice(calculateTotalPrice())}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      onClick={handleAddToCart}
                      disabled={addingToCart || !selectedSize}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white text-lg py-6 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          Adicionar ao Carrinho -{' '}
                          {formatPrice(calculateTotalPrice())}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Shipping & Guarantees */}
                <Card className="border border-gray-200 bg-gray-50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4 text-gray-900">
                      Entrega e Garantias
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Truck className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Entrega Expressa
                          </p>
                          <p className="text-sm text-gray-600">
                            Receba em até 7 dias úteis em todo o Brasil
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Garantia de Qualidade
                          </p>
                          <p className="text-sm text-gray-600">
                            100% Original com certificado de autenticidade
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <RotateCcw className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Troca Grátis
                          </p>
                          <p className="text-sm text-gray-600">
                            Troque sem custos em até 30 dias corridos
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Palette className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Personalização Profissional
                          </p>
                          <p className="text-sm text-gray-600">
                            Estampa de alta qualidade que não desbota nem
                            descola
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

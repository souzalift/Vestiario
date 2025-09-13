'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { toast } from 'sonner';

// UI e Ícones
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Shield,
  Loader2,
  Palette,
} from 'lucide-react';
import { getProductBySlug } from '@/services/products';
import type { Product } from '@/services/products';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [customization, setCustomization] = useState({ name: '', number: '' });
  const [isAdding, setIsAdding] = useState(false);

  const slug = params.slug as string;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProductBySlug(slug);
        if (productData) {
          setProduct(productData);
          setSelectedImage(productData.images?.[0] || '');
          if (productData.sizes && productData.sizes.length > 0) {
            setSelectedSize(productData.sizes[0]);
          }
        } else {
          toast.error('Produto não encontrado.');
        }
      } catch (err) {
        toast.error('Erro ao carregar o produto.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || !product.id || isAdding) return;
    if (!selectedSize) {
      toast.error('Por favor, selecione um tamanho.');
      return;
    }

    setIsAdding(true);

    const productData = {
      productId: product.id,
      productSlug: product.slug,
      title: product.title,
      basePrice: product.price,
      image: product.images?.[0] || '',
      team: product.team,
      category: product.league,
    };

    const options = {
      size: selectedSize,
      quantity: 1,
      customization:
        customization.name || customization.number ? customization : null,
    };

    addItem(productData, options);

    setIsAdding(false);
  };

  const handleToggleFavorite = () => {
    if (!product || !product.id) return;

    if (isFavorite(product.id)) {
      removeFavorite(product.id);
      toast.info(`${product.title} removido dos favoritos.`);
    } else {
      addFavorite(product.id);
      toast.success(`${product.title} adicionado favoritos.`);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl font-bold mb-4">Produto não encontrado</h1>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para a loja
          </Link>
        </Button>
      </div>
    );
  }

  const finalPrice =
    product.price +
    (customization.name || customization.number ? 20 : 0) +
    (selectedSize === 'XGG' ? 15 : 0);

  const isFavorited = product && product.id ? isFavorite(product.id) : false;

  return (
    <div className="bg-gray-50">
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Coluna da Esquerda: Galeria de Imagens */}
            <div>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-white shadow-lg">
                <Image
                  src={selectedImage}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              <div className="mt-4 grid grid-cols-5 gap-4">
                {product.images?.map((img, index) => (
                  <Button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? 'border-indigo-600 scale-110'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </Button>
                ))}
              </div>
            </div>

            {/* Coluna da Direita: Detalhes e Ações */}
            <div className="space-y-6">
              <div>
                <Link
                  href="/#produtos"
                  className="text-sm text-gray-500 hover:text-gray-900 inline-block mb-4"
                >
                  &larr; Voltar para todos os produtos
                </Link>
                <h1 className="text-4xl font-bold text-gray-900">
                  {product.title}
                </h1>
                <p className="text-lg text-gray-600 mt-2">{product.team}</p>
              </div>
              <p className="text-gray-700 text-base leading-relaxed">
                {product.description}
              </p>

              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <p className="text-4xl font-bold text-gray-900">
                      {formatPrice(finalPrice)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      ou 3x de {formatPrice(finalPrice / 3)} sem juros
                    </p>
                    {selectedSize === 'XGG' && (
                      <div className="mt-2 text-amber-800 bg-amber-50 rounded px-3 py-2 text-sm font-semibold">
                        + R$ 15,00 para tamanho XGG.
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      Tamanho *
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes?.map((size) => (
                        <Button
                          key={size}
                          type="button"
                          variant={
                            selectedSize === size ? 'default' : 'outline'
                          }
                          onClick={() => setSelectedSize(size)}
                          className="w-14 h-14 font-bold text-base"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-gray-500" />{' '}
                      Personalização (+ R$ 20,00)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm">
                          Nome
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
                          maxLength={15}
                        />
                      </div>
                      <div>
                        <Label htmlFor="number" className="text-sm">
                          Número
                        </Label>
                        <Input
                          id="number"
                          type="number"
                          placeholder="Ex: 9"
                          value={customization.number}
                          onChange={(e) =>
                            setCustomization({
                              ...customization,
                              number: e.target.value,
                            })
                          }
                          max={99}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={handleAddToCart}
                      disabled={!selectedSize || isAdding}
                      size="lg"
                      className="w-full h-14 text-lg"
                    >
                      {isAdding ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-5 w-5 mr-2" />
                      )}
                      {isAdding ? 'A adicionar...' : 'Adicionar ao Carrinho'}
                    </Button>
                    <Button
                      onClick={handleToggleFavorite}
                      size="lg"
                      variant="outline"
                      className="h-14"
                    >
                      <Heart
                        className={`w-6 h-6 transition-all ${
                          isFavorited
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-500'
                        }`}
                      />
                    </Button>
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

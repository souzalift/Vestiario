'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { IProduct } from '@/models/Product';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function ProductPage() {
  const params = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [customization, setCustomization] = useState({
    name: '',
    number: '',
  });

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.data);
      } else {
        // Use mock data for demonstration
        setProduct(getMockProduct(id));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(getMockProduct(id));
    } finally {
      setLoading(false);
    }
  };

  const getMockProduct = (id: string): IProduct | null => {
    const mockProducts: IProduct[] = [
      {
        _id: '1',
        title: 'Camisa Brasil 2024',
        description: 'Camisa oficial da Seleção Brasileira para 2024. Tecido de alta qualidade com tecnologia Dri-FIT para máximo conforto e performance. Ideal para torcer pelo Brasil ou praticar esportes.',
        price: 89.90,
        image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=800',
        sizes: ['P', 'M', 'G', 'GG'],
        slug: 'camisa-brasil-2024',
        categories: ['seleções', 'brasil'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: '2',
        title: 'Camisa Real Madrid Home',
        description: 'Camisa titular do Real Madrid temporada atual. Design clássico em branco com detalhes dourados. Material respirável e de alta durabilidade.',
        price: 129.90,
        image: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800',
        sizes: ['P', 'M', 'G', 'GG', 'XG'],
        slug: 'camisa-real-madrid-home',
        categories: ['clubes', 'espanha'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: '3',
        title: 'Camisa Barcelona Away',
        description: 'Camisa visitante do FC Barcelona. Design moderno e elegante com as cores tradicionais do clube. Perfeita para os verdadeiros culés.',
        price: 124.90,
        image: 'https://images.pexels.com/photos/2752379/pexels-photo-2752379.jpeg?auto=compress&cs=tinysrgb&w=800',
        sizes: ['P', 'M', 'G', 'GG'],
        slug: 'camisa-barcelona-away',
        categories: ['clubes', 'espanha'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: '4',
        title: 'Camisa Argentina 2024',
        description: 'Camisa oficial da Seleção Argentina. Com as tradicionais listras azul e branco, esta camisa representa a paixão e tradição do futebol argentino.',
        price: 94.90,
        image: 'https://images.pexels.com/photos/1884576/pexels-photo-1884576.jpeg?auto=compress&cs=tinysrgb&w=800',
        sizes: ['P', 'M', 'G', 'GG'],
        slug: 'camisa-argentina-2024',
        categories: ['seleções', 'argentina'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: '5',
        title: 'Camisa Manchester United',
        description: 'Camisa titular do Manchester United. O icônico vermelho dos Red Devils com detalhes únicos. Material premium para máximo conforto.',
        price: 119.90,
        image: 'https://images.pexels.com/photos/2570139/pexels-photo-2570139.jpeg?auto=compress&cs=tinysrgb&w=800',
        sizes: ['P', 'M', 'G', 'GG', 'XG'],
        slug: 'camisa-manchester-united',
        categories: ['clubes', 'inglaterra'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: '6',
        title: 'Camisa Flamengo 2024',
        description: 'Camisa oficial do Clube de Regatas do Flamengo. Com o manto sagrado rubro-negro, esta camisa é perfeita para a Nação Rubro-Negra.',
        price: 79.90,
        image: 'https://images.pexels.com/photos/1884575/pexels-photo-1884575.jpeg?auto=compress&cs=tinysrgb&w=800',
        sizes: ['P', 'M', 'G', 'GG'],
        slug: 'camisa-flamengo-2024',
        categories: ['clubes', 'brasil'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return mockProducts.find(p => p._id === id) || null;
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!selectedSize) {
      toast.error('Por favor, selecione um tamanho');
      return;
    }

    const cartItem = {
      id: `${product._id}-${selectedSize}-${customization.name}-${customization.number}`,
      title: product.title,
      price: product.price,
      image: product.image,
      size: selectedSize,
      customization,
    };

    addItem(cartItem);
    toast.success('Produto adicionado ao carrinho!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-gray-300 aspect-square rounded-lg"></div>
                <div className="space-y-4">
                  <div className="bg-gray-300 h-8 rounded"></div>
                  <div className="bg-gray-300 h-6 rounded w-1/3"></div>
                  <div className="bg-gray-300 h-20 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h1>
            <Link href="/">
              <Button>Voltar para a página inicial</Button>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para produtos
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-white shadow-lg">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                <p className="text-3xl font-bold text-blue-600">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
              </div>

              <p className="text-gray-600 text-lg">{product.description}</p>

              <Card>
                <CardContent className="p-6 space-y-6">
                  {/* Size Selection */}
                  <div>
                    <Label htmlFor="size" className="text-base font-medium">
                      Tamanho *
                    </Label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Selecione o tamanho" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.sizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Customization */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-base font-medium">
                        Nome (Opcional)
                      </Label>
                      <Input
                        id="name"
                        placeholder="Digite o nome"
                        value={customization.name}
                        onChange={(e) => setCustomization({ ...customization, name: e.target.value })}
                        className="mt-2"
                        maxLength={15}
                      />
                    </div>
                    <div>
                      <Label htmlFor="number" className="text-base font-medium">
                        Número (Opcional)
                      </Label>
                      <Input
                        id="number"
                        placeholder="Digite o número"
                        value={customization.number}
                        onChange={(e) => setCustomization({ ...customization, number: e.target.value })}
                        className="mt-2"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleAddToCart}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                    size="lg"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                </CardContent>
              </Card>

              {/* Product Info */}
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3">Informações do Produto</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Material: 100% Poliéster com tecnologia Dri-FIT</li>
                  <li>• Personalização incluída</li>
                  <li>• Tamanhos disponíveis: {product.sizes.join(', ')}</li>
                  <li>• Entrega em até 7 dias úteis</li>
                  <li>• Garantia de qualidade</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
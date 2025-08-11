/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Save, ArrowLeft, Eye, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  featured: boolean;
  tags: string[];
  brand?: string;
  league?: string;
  playerName?: string;
  playerNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
}

export default function EditProductPage() {
  const { isAdmin, isLoaded } = useAdmin();
  const router = useRouter();
  const params = useParams();
  const productId = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [brand, setBrand] = useState('');
  const [league, setLeague] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');

  // Aux states
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isLoaded) {
      if (!isAdmin) {
        router.push('/');
        return;
      }
      loadProduct();
    }
  }, [isLoaded, isAdmin, router, productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        toast.error('Produto não encontrado');
        router.push('/admin/products');
        return;
      }

      const data = productSnap.data() as Product;
      const { id, ...rest } = data;
      setProduct({ id: productSnap.id, ...rest });

      setTitle(data.title || '');
      setDescription(data.description || '');
      setPrice(data.price?.toString() || '');
      setImages(data.images || []);
      setSizes(data.sizes || []);
      setFeatured(data.featured || false);
      setTags(data.tags || []);
      setBrand(data.brand || '');
      setLeague(data.league || '');
      setPlayerName(data.playerName || '');
      setPlayerNumber(data.playerNumber || '');
    } catch (error) {
      toast.error('Erro ao carregar produto');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Título é obrigatório';
    if (!description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Preço deve ser um número válido maior que 0';
    }
    if (!league.trim()) newErrors.league = 'Liga é obrigatória';
    if (images.length === 0)
      newErrors.images = 'Pelo menos uma imagem é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Verifique os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const updatedProduct = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        images: images.filter(Boolean),
        sizes,
        featured,
        tags: tags.filter((tag) => tag.trim()),
        brand: brand.trim() || null,
        league: league.trim(),
        playerName: playerName.trim() || null,
        playerNumber: playerNumber.trim() || null,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'products', productId), updatedProduct);

      toast.success('Produto atualizado com sucesso!');
      router.push('/admin/products');
    } catch (error) {
      toast.error('Erro ao atualizar produto');
    } finally {
      setSaving(false);
    }
  };

  // Funções para listas
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSizesChange = (value: string) => {
    // Permite vírgulas dentro de aspas
    const regex = /"([^"]+)"|([^,]+)/g;
    const result: string[] = [];
    let match;
    while ((match = regex.exec(value))) {
      if (match[1]) {
        result.push(match[1].trim());
      } else if (match[2]) {
        result.push(match[2].trim());
      }
    }
    setSizes(result.filter(Boolean));
  };

  const handleImageChange = (index: number, value: string) => {
    const imgs = [...images];
    imgs[index] = value;
    setImages(imgs);
  };

  const addImageField = () => {
    setImages((prev) => [...prev, '']);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2 border-gray-300 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                Editar Produto
              </h1>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>

          <Card className="border-gray-200 shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-gray-900">
                Informações do Produto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-gray-700 font-medium">
                  Título *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nome do produto"
                  className={`mt-1 ${
                    errors.title
                      ? 'border-red-500'
                      : 'border-gray-200 focus:border-gray-400'
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="description"
                  className="text-gray-700 font-medium"
                >
                  Descrição *
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição detalhada do produto"
                  rows={4}
                  className={`mt-1 ${
                    errors.description
                      ? 'border-red-500'
                      : 'border-gray-200 focus:border-gray-400'
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="price" className="text-gray-700 font-medium">
                  Preço (R$) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`mt-1 ${
                    errors.price
                      ? 'border-red-500'
                      : 'border-gray-200 focus:border-gray-400'
                  }`}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>
              <div>
                <Label htmlFor="league" className="text-gray-700 font-medium">
                  Liga *
                </Label>
                <Input
                  id="league"
                  value={league}
                  onChange={(e) => setLeague(e.target.value)}
                  placeholder="Ex: Brasileirão"
                  className={`mt-1 ${
                    errors.league
                      ? 'border-red-500'
                      : 'border-gray-200 focus:border-gray-400'
                  }`}
                />
                {errors.league && (
                  <p className="text-red-500 text-sm mt-1">{errors.league}</p>
                )}
              </div>
              <div>
                <Label htmlFor="brand" className="text-gray-700 font-medium">
                  Marca
                </Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ex: Adidas"
                  className="mt-1 border-gray-200 focus:border-gray-400"
                />
              </div>
              <div>
                <Label
                  htmlFor="playerName"
                  className="text-gray-700 font-medium"
                >
                  Nome do jogador
                </Label>
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ex: Coutinho"
                  className="mt-1 border-gray-200 focus:border-gray-400"
                />
              </div>
              <div>
                <Label
                  htmlFor="playerNumber"
                  className="text-gray-700 font-medium"
                >
                  Número do jogador
                </Label>
                <Input
                  id="playerNumber"
                  value={playerNumber}
                  onChange={(e) => setPlayerNumber(e.target.value)}
                  placeholder="Ex: 10"
                  className="mt-1 border-gray-200 focus:border-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="sizes" className="text-gray-700 font-medium">
                  Tamanhos (separados por vírgula, use aspas para tamanhos com
                  vírgula)
                </Label>
                <Input
                  id="sizes"
                  value={sizes
                    .map((s) => (s.includes(',') ? `"${s}"` : s))
                    .join(', ')}
                  onChange={(e) => handleSizesChange(e.target.value)}
                  placeholder='Ex: P, M, G, "Infantil, Baby"'
                  className="mt-1 border-gray-200 focus:border-gray-400"
                />
              </div>
              <div>
                <Label className="text-gray-700 font-medium">
                  Imagens (URLs) *
                </Label>
                <div className="space-y-2 mt-1">
                  {images.map((img, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={img}
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                        placeholder={`URL da imagem ${idx + 1}`}
                        className="bg-white"
                      />
                      {idx === images.length - 1 && (
                        <Button
                          type="button"
                          onClick={addImageField}
                          variant="outline"
                          size="icon"
                          className="border-gray-300"
                          title="Adicionar imagem"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.images && (
                  <p className="text-red-500 text-sm mt-2">{errors.images}</p>
                )}
              </div>
              <div>
                <Label className="text-gray-700 font-medium">Tags</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Adicionar tag"
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    className="border-gray-200 focus:border-gray-400"
                  />
                  <Button
                    onClick={addTag}
                    size="sm"
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      {tag}
                      <button onClick={() => removeTag(index)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  name="featured"
                  checked={featured}
                  onChange={() => setFeatured(!featured)}
                  id="featured"
                  className="accent-gray-900 w-4 h-4"
                />
                <Label htmlFor="featured" className="text-sm text-gray-700">
                  Produto em destaque
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import ImageUpload from '@/components/ImageUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Package,
  Save,
  ArrowLeft,
  X,
  Plus,
  Eye,
  Loader2,
  Camera,
  Tag,
  DollarSign,
  FileText,
  Star,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  league: string;
  brand?: string;
  team: string;
  size?: string[];
  images: string[];
  tags: string[];
  isActive: boolean;
  featured: boolean;
  createdAt: any;
  updatedAt?: any;
}

export default function EditProductPage() {
  const { isAdmin, isLoaded } = useAdmin();
  const router = useRouter();
  const params = useParams();
  const productId = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [leagues, setLeagues] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Estados do formulário
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [slug, setSlug] = useState('');
  const [league, setLeague] = useState('');
  const [brand, setBrand] = useState('');
  const [team, setTeam] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [featured, setIsFeatured] = useState(false);

  // Estados auxiliares
  const [newTag, setNewTag] = useState('');
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (isLoaded) {
      if (!isAdmin) {
        router.push('/');
        return;
      }
      loadProduct();
      loadLeagues();
    }
  }, [isLoaded, isAdmin, router, productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        toast.error('Produto não encontrado');
        router.push('/admin/produtos');
        return;
      }

      const productData = {
        id: productSnap.id,
        ...productSnap.data(),
      } as Product;
      setProduct(productData);

      // Preencher o formulário
      setTitle(productData.title || '');
      setSlug(productData.slug || '');
      setDescription(productData.description || '');
      setPrice(productData.price?.toString() || '');
      setLeague(productData.league || ''); // Troque category por league
      setBrand(productData.brand || '');
      setTeam(productData.team || '');

      setSizes(productData.size || ['P', 'M', 'G', 'GG', 'XGG']);
      setImages(
        Array.isArray(productData.images)
          ? productData.images.filter(
              (img: string) => !!img && img.trim() !== '',
            )
          : [],
      );
      setTags(productData.tags || []);

      setIsActive(productData.isActive ?? true);
      setIsFeatured(productData.featured ?? false);
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      toast.error('Erro ao carregar produto');
      router.push('/admin/produtos');
    } finally {
      setLoading(false);
    }
  };

  const loadLeagues = async () => {
    try {
      const productsRef = collection(db, 'products');
      const productsSnap = await getDocs(productsRef);

      const uniqueLeagues = Array.from(
        new Set(
          productsSnap.docs.map((doc) => doc.data().league).filter(Boolean),
        ),
      ).sort();

      setLeagues(uniqueLeagues);
    } catch (error) {
      console.error('Erro ao carregar ligas:', error);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = 'Título é obrigatório';
    if (!description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Preço deve ser um número válido maior que 0';
    }
    if (!league.trim()) newErrors.league = 'Liga é obrigatória'; // Troque category por league
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
        league: league.trim(),
        brand: brand.trim() || null,
        team: team.trim() || null,
        sizes: sizes.length > 0 ? sizes : null,
        images,
        tags: tags.filter((tag) => tag.trim()),
        isActive,
        featured,
        slug: slug.trim(),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'products', productId), updatedProduct);

      toast.success('Produto atualizado com sucesso!');
      router.push('/admin/produtos');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro ao atualizar produto');
    } finally {
      setSaving(false);
    }
  };

  // Funções para gerenciar listas
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const toggleSize = (size: string) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter((s) => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
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
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center gap-2 border-gray-300 hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">
                  Editar Produto
                </h1>
              </div>
              <p className="text-gray-600">Editando: {product?.title}</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/produtos/${productId}`)}
                className="flex items-center gap-2 border-gray-300 hover:bg-gray-100"
              >
                <Eye className="w-4 h-4" />
                Visualizar
              </Button>
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
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações Básicas */}
            <div className="lg:col-span-2 space-y-6">
              {/* Título e Descrição */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label
                      htmlFor="title"
                      className="text-gray-700 font-medium"
                    >
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
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* CAMPO DE SLUG */}
                  <div>
                    <Label htmlFor="slug" className="text-gray-700 font-medium">
                      Slug (URL)
                    </Label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="exemplo-camisa-2025"
                      className="mt-1 border-gray-200 focus:border-gray-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      O slug é usado na URL do produto. Use apenas letras,
                      números e hífens.
                    </p>
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
                </CardContent>
              </Card>

              {/* Preço */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    Preço
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div>
                    <Label
                      htmlFor="price"
                      className="text-gray-700 font-medium"
                    >
                      Preço *
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
                      <p className="text-red-500 text-sm mt-1">
                        {errors.price}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Liga (no lugar de Categoria) */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Tag className="w-5 h-5 text-gray-600" />
                    Liga
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label
                      htmlFor="league"
                      className="text-gray-700 font-medium"
                    >
                      Liga *
                    </Label>
                    <Select value={league} onValueChange={setLeague}>
                      <SelectTrigger
                        className={`mt-1 ${
                          errors.league
                            ? 'border-red-500'
                            : 'border-gray-200 focus:border-gray-400'
                        }`}
                      >
                        <SelectValue placeholder="Selecione uma liga" />
                      </SelectTrigger>
                      <SelectContent>
                        {leagues.map((lg) => (
                          <SelectItem key={lg} value={lg}>
                            {lg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.league && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.league}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="brand"
                        className="text-gray-700 font-medium"
                      >
                        Marca
                      </Label>
                      <Input
                        id="brand"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="Ex: Nike, Adidas"
                        className="mt-1 border-gray-200 focus:border-gray-400"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="team"
                        className="text-gray-700 font-medium"
                      >
                        Time
                      </Label>
                      <Input
                        id="team"
                        value={team}
                        onChange={(e) => setTeam(e.target.value)}
                        placeholder="Ex: Brasil, Barcelona"
                        className="mt-1 border-gray-200 focus:border-gray-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4"></div>
                </CardContent>
              </Card>

              {/* Tamanhos */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-gray-900">
                    Tamanhos Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {['P', 'M', 'G', 'GG', 'XGG'].map((size) => (
                      <Button
                        key={size}
                        variant={sizes.includes(size) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleSize(size)}
                        className={
                          sizes.includes(size)
                            ? 'bg-gray-900 hover:bg-gray-800 text-white'
                            : 'border-gray-300 hover:bg-gray-100'
                        }
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                  {sizes.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Tamanhos selecionados: {sizes.join(', ')}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-gray-900">Tags</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Adicionar tag"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
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
                  <div className="flex flex-wrap gap-2">
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
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <TrendingUp className="w-5 h-5 text-gray-600" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="active"
                      className="text-gray-700 font-medium"
                    >
                      Produto Ativo
                    </Label>
                    <Button
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setIsActive(!isActive)}
                      className={
                        isActive
                          ? 'bg-gray-900 hover:bg-gray-800 text-white'
                          : 'border-gray-300 hover:bg-gray-100'
                      }
                    >
                      {isActive ? 'Ativo' : 'Inativo'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="isfeatured"
                      className="text-gray-700 font-medium"
                    >
                      Produto em Destaque
                    </Label>
                    <Button
                      variant={featured ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setIsFeatured(!featured)}
                      className={
                        featured
                          ? 'bg-gray-900 hover:bg-gray-800 text-white'
                          : 'border-gray-300 hover:bg-gray-100'
                      }
                    >
                      {featured ? (
                        <>
                          <Star className="w-4 h-4 mr-1" />
                          Destaque
                        </>
                      ) : (
                        'Normal'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Imagens */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Camera className="w-5 h-5 text-gray-600" />
                    Imagens *
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ImageUpload
                    images={images}
                    onImagesChange={setImages}
                    maxImages={8}
                  />
                  {errors.images && (
                    <p className="text-red-500 text-sm mt-2">{errors.images}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import Header from '@/components/Header';
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
  description: string;
  price: number;
  category: string;
  brand?: string;
  team?: string;
  season?: string;
  size?: string[];
  color?: string;
  material?: string;
  images: string[];
  tags: string[];
  features: string[];
  views: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
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
  const [categories, setCategories] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Estados do formulário
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [team, setTeam] = useState('');
  const [season, setSeason] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

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
      loadCategories();
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

      const productData = {
        id: productSnap.id,
        ...productSnap.data(),
      } as Product;
      setProduct(productData);

      // Preencher o formulário
      setTitle(productData.title || '');
      setDescription(productData.description || '');
      setPrice(productData.price?.toString() || '');
      setCategory(productData.category || '');
      setBrand(productData.brand || '');
      setTeam(productData.team || '');
      setSeason(productData.season || '');
      setColor(productData.color || '');
      setMaterial(productData.material || '');
      setSizes(productData.size || []);
      setImages(productData.images || []);
      setTags(productData.tags || []);
      setFeatures(productData.features || []);
      setIsActive(productData.isActive ?? true);
      setIsFeatured(productData.isFeatured ?? false);
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      toast.error('Erro ao carregar produto');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const productsRef = collection(db, 'products');
      const productsSnap = await getDocs(productsRef);

      const uniqueCategories = Array.from(
        new Set(
          productsSnap.docs.map((doc) => doc.data().category).filter(Boolean),
        ),
      ).sort();

      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = 'Título é obrigatório';
    if (!description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Preço deve ser um número válido maior que 0';
    }
    if (!category.trim()) newErrors.category = 'Categoria é obrigatória';
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
        category: category.trim(),
        brand: brand.trim() || null,
        team: team.trim() || null,
        season: season.trim() || null,
        color: color.trim() || null,
        material: material.trim() || null,
        size: sizes.length > 0 ? sizes : null,
        images,
        tags: tags.filter((tag) => tag.trim()),
        features: features.filter((feature) => feature.trim()),
        isActive,
        isFeatured,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'products', productId), updatedProduct);

      toast.success('Produto atualizado com sucesso!');
      router.push('/admin/products');
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

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
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
      <Header />

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
                onClick={() => router.push(`/products/${productId}`)}
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

              {/* Categorização */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Tag className="w-5 h-5 text-gray-600" />
                    Categorização
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label
                      htmlFor="category"
                      className="text-gray-700 font-medium"
                    >
                      Categoria *
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger
                        className={`mt-1 ${
                          errors.category
                            ? 'border-red-500'
                            : 'border-gray-200 focus:border-gray-400'
                        }`}
                      >
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.category}
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label
                        htmlFor="season"
                        className="text-gray-700 font-medium"
                      >
                        Temporada
                      </Label>
                      <Input
                        id="season"
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                        placeholder="Ex: 2024/25"
                        className="mt-1 border-gray-200 focus:border-gray-400"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="color"
                        className="text-gray-700 font-medium"
                      >
                        Cor
                      </Label>
                      <Input
                        id="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="Ex: Azul, Verde"
                        className="mt-1 border-gray-200 focus:border-gray-400"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="material"
                        className="text-gray-700 font-medium"
                      >
                        Material
                      </Label>
                      <Input
                        id="material"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        placeholder="Ex: Poliéster, Algodão"
                        className="mt-1 border-gray-200 focus:border-gray-400"
                      />
                    </div>
                  </div>
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
                    {['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG'].map((size) => (
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

              {/* Features */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-gray-900">
                    Características
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Adicionar característica"
                      onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                      className="border-gray-200 focus:border-gray-400"
                    />
                    <Button
                      onClick={addFeature}
                      size="sm"
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <span className="text-sm text-gray-700">{feature}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFeature(index)}
                          className="hover:bg-gray-200"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
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
                      htmlFor="isActive"
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
                      htmlFor="isFeatured"
                      className="text-gray-700 font-medium"
                    >
                      Produto em Destaque
                    </Label>
                    <Button
                      variant={isFeatured ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setIsFeatured(!isFeatured)}
                      className={
                        isFeatured
                          ? 'bg-gray-900 hover:bg-gray-800 text-white'
                          : 'border-gray-300 hover:bg-gray-100'
                      }
                    >
                      {isFeatured ? (
                        <>
                          <Star className="w-4 h-4 mr-1" />
                          Destaque
                        </>
                      ) : (
                        'Normal'
                      )}
                    </Button>
                  </div>

                  {/* Estatísticas */}
                  {product && (
                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Visualizações:</span>
                        <span className="font-medium text-gray-900">
                          {product.views}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avaliação:</span>
                        <span className="font-medium text-gray-900"></span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avaliações:</span>
                        <span className="font-medium text-gray-900">
                          {product.reviewCount}
                        </span>
                      </div>
                    </div>
                  )}
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

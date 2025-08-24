'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

// Firebase
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Componentes, UI e Ícones
import ImageUpload from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Loader2,
  Save,
  X,
  Plus,
  FileText,
  Camera,
  DollarSign,
  Tag,
  TrendingUp,
  Star,
  Eye,
} from 'lucide-react';

// Esquema de validação
const productSchema = z.object({
  title: z.string().min(5, 'Título é obrigatório.'),
  slug: z
    .string()
    .min(5, 'Slug é obrigatório.')
    .regex(/^[a-z0-9-]+$/, 'Slug inválido.'),
  description: z.string().min(10, 'Descrição é obrigatória.'),
  price: z.coerce
    .number()
    .min(1, 'Preço deve ser um número válido maior que 0.'),
  league: z.string().min(1, 'Liga é obrigatória.'),
  brand: z.string().optional(),
  team: z.string().optional(),
  sizes: z.array(z.string()).min(1, 'Selecione pelo menos um tamanho.'),
  tags: z.array(z.string()).min(1, 'Adicione pelo menos uma tag.'),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.slug as string;

  const [images, setImages] = useState<string[]>([]);
  const [leagues, setLeagues] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    watch,
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const currentTags = watch('tags', []);
  const currentSizes = watch('sizes', []);
  const currentLeague = watch('league');
  const currentTeam = watch('team');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
          toast.error('Produto não encontrado');
          router.push('/admin/produtos');
          return;
        }
        const productData = productSnap.data();
        reset(productData);
        setImages(productData.images || []);

        const productsRef = collection(db, 'products');
        const productsSnap = await getDocs(productsRef);
        const uniqueLeagues = Array.from(
          new Set(
            productsSnap.docs.map((doc) => doc.data().league).filter(Boolean),
          ),
        ).sort();
        setLeagues(uniqueLeagues as string[]);
      } catch (error) {
        toast.error('Erro ao carregar dados do produto.');
      } finally {
        setLoading(false);
      }
    };
    if (productId) {
      loadInitialData();
    }
  }, [productId, reset, router]);

  const addTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      setValue('tags', [...currentTags, newTag.trim()], {
        shouldValidate: true,
      });
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setValue(
      'tags',
      currentTags.filter((_, i) => i !== index),
      { shouldValidate: true },
    );
  };

  const toggleSize = (size: string) => {
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter((s) => s !== size)
      : [...currentSizes, size];
    setValue('sizes', newSizes, { shouldValidate: true });
  };

  const handleAddImageUrl = () => {
    if (
      newImageUrl.trim() &&
      (newImageUrl.startsWith('http://') || newImageUrl.startsWith('https://'))
    ) {
      if (images.length >= 8) {
        toast.error('Você pode ter no máximo 8 imagens.');
        return;
      }
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
      toast.success('Imagem adicionada por URL.');
    } else {
      toast.error('Por favor, insira um URL válido.');
    }
  };

  const onSave = async (data: ProductFormData) => {
    if (images.length === 0) {
      toast.error('O produto deve ter pelo menos uma imagem.');
      return;
    }
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        ...data,
        images,
        updatedAt: serverTimestamp(),
      });
      toast.success('Produto atualizado com sucesso!');
      router.push('/admin/produtos');
    } catch (error) {
      toast.error('Erro ao atualizar o produto.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSave)}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Produto</h1>
            <p className="text-gray-600 mt-1">
              A fazer alterações em: {watch('title')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/produtos">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Link>
            </Button>
            <Button
              className="text-white"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'A guardar...' : 'Guardar Alterações'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText /> Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input id="title" {...register('title')} />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input id="slug" {...register('slug')} />
                  {errors.slug && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.slug.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera /> Imagens *
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  maxImages={8}
                  league={currentLeague}
                  team={currentTeam}
                />
                <div className="mt-4 border-t pt-4">
                  <Label htmlFor="imageUrl">Adicionar imagem por URL</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="imageUrl"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Cole o link da imagem aqui"
                    />
                    <Button type="button" onClick={handleAddImageUrl}>
                      <Plus className="text-white w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tamanhos Disponíveis *</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  {['P', 'M', 'G', 'GG', 'XGG'].map((size) => (
                    <Button
                      className="text-white"
                      key={size}
                      type="button"
                      variant={
                        currentSizes.includes(size) ? 'default' : 'outline'
                      }
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
                {errors.sizes && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.sizes.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp /> Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Produto Ativo</Label>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Produto em Destaque</Label>
                  <Controller
                    name="featured"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign /> Preço
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div>
                  <Label htmlFor="price">Preço (BRL) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price')}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.price.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag /> Organização
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label>Liga *</Label>
                  <Controller
                    name="league"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
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
                    )}
                  />
                  {errors.league && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.league.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Marca</Label>
                  <Input {...register('brand')} />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input {...register('team')} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tags *</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Adicionar tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentTags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}{' '}
                      <Button
                        type="button"
                        className="ml-2"
                        onClick={() => removeTag(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                {errors.tags && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.tags.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

// Firebase
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

// UI e Ícones
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';

// CORREÇÃO: Esquema de validação atualizado para aceitar arrays
const productSchema = z.object({
  title: z.string().min(5, 'O título é obrigatório.'),
  slug: z
    .string()
    .min(5, 'O slug é obrigatório.')
    .regex(/^[a-z0-9-]+$/, 'Slug inválido.'),
  description: z.string().min(10, 'A descrição é obrigatória.'),
  price: z.coerce.number().min(1, 'O preço é obrigatório.'),
  sizes: z.array(z.string()).min(1, 'Selecione pelo menos um tamanho.'),
  tags: z.array(z.string()).min(1, 'Adicione pelo menos uma tag.'),
  brand: z.string().optional(),
  team: z.string().optional(),
  league: z.string().optional(),
  featured: z.boolean().default(false),
  playerName: z.string().optional(),
  playerNumber: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AdminNewProductPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      featured: false,
      sizes: [],
      tags: [],
    },
  });

  const currentTags = watch('tags', []);
  const currentSizes = watch('sizes', []);

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

  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0) {
      toast.error('Adicione pelo menos uma imagem.');
      return;
    }
    try {
      // A função uploadImages já existe no seu código e está correta
      // const imageUrls = await uploadImages(imageFiles, data.league);

      // CORREÇÃO: Não é mais necessário usar .split(), pois os dados já são arrays
      await addDoc(collection(db, 'products'), {
        ...data,
        images: images, // Usa as imagens do componente ImageUpload
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Produto criado com sucesso!');
      router.push('/admin/produtos');
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast.error('Não foi possível criar o produto.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Novo Produto</h1>
            <p className="text-gray-600 mt-1">
              Preencha os detalhes para adicionar uma nova camisa.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/produtos">
                <ArrowLeft className="w-4 h-4 mr-2" /> Cancelar
              </Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'A guardar...' : 'Guardar Produto'}
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
                />
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
                  <Input {...register('league')} />
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

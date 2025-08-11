'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Shirt, Sparkles, UploadCloud } from 'lucide-react';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  type ProductForm = {
    title: string;
    description: string;
    price: string;
    images: string[];
    sizes: string[];
    featured: boolean;
    tags: string[];
    brand: string;
    league: string;
    playerName: string;
    playerNumber: string;
  };

  const [form, setForm] = useState<ProductForm>({
    title: '',
    description: '',
    price: '',
    images: [''],
    sizes: [],
    featured: false,
    tags: [],
    brand: '',
    league: '',
    playerName: '',
    playerNumber: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value,
    }));
  };

  const handleArrayChange = (name: string, value: string) => {
    // Permite vírgulas dentro dos tamanhos, mas separa por vírgula apenas se não estiver entre aspas
    if (name === 'sizes') {
      // Exemplo: P, M, G, GG, "Infantil, Baby", "Adulto, Unissex"
      // Vai separar por vírgula, mas preserva os que estão entre aspas
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
      setForm((prev) => ({
        ...prev,
        [name]: result.filter(Boolean),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
      }));
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const images = [...form.images];
    images[index] = value;
    setForm((prev) => ({ ...prev, images }));
  };

  const addImageField = () => {
    setForm((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!form.title || !form.price || !form.league) {
        toast.error('Preencha os campos obrigatórios: título, preço e liga.');
        setLoading(false);
        return;
      }

      const slug = generateSlug(form.title);

      const productData = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        images: form.images.filter(Boolean),
        sizes: form.sizes,
        featured: form.featured,
        tags: form.tags,
        brand: form.brand,
        league: form.league,
        playerName: form.playerName,
        playerNumber: form.playerNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
        slug,
      };

      await addDoc(collection(db, 'products'), productData);

      toast.success('Produto criado com sucesso!');
      router.push('/admin/products');
    } catch (error) {
      toast.error('Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 rounded-lg shadow-xl py-10 px-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shirt className="w-7 h-7 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Novo Produto</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Título *
              </label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Título do produto"
                className="bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Liga *
              </label>
              <Input
                name="league"
                value={form.league}
                onChange={handleChange}
                required
                placeholder="Ex: Brasileirão"
                className="bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Marca
              </label>
              <Input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Ex: Adidas"
                className="bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Preço (R$) *
              </label>
              <Input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
                placeholder="Preço"
                className="bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Descrição
            </label>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descrição detalhada"
              className="bg-white"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tamanhos (separados por vírgula)
              </label>
              <Input
                name="sizes"
                value={form.sizes.join(', ')}
                onChange={(e) => handleArrayChange('sizes', e.target.value)}
                placeholder="Ex: P, M, G, GG"
                className="bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tags (separadas por vírgula)
              </label>
              <Input
                name="tags"
                value={form.tags.join(', ')}
                onChange={(e) => handleArrayChange('tags', e.target.value)}
                placeholder="Ex: camisa, futebol, oficial"
                className="bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Imagens (URLs)
            </label>
            <div className="space-y-2">
              {form.images.map((img, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={img}
                    onChange={(e) => handleImageChange(idx, e.target.value)}
                    placeholder={`URL da imagem ${idx + 1}`}
                    className="bg-white"
                  />
                  {idx === form.images.length - 1 && (
                    <Button
                      type="button"
                      onClick={addImageField}
                      variant="outline"
                      size="icon"
                      className="border-gray-300"
                      title="Adicionar imagem"
                    >
                      <UploadCloud className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
              id="featured"
              className="accent-blue-600 w-4 h-4"
            />
            <label
              htmlFor="featured"
              className="text-sm text-gray-700 font-semibold"
            >
              Produto em destaque
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nome do jogador
              </label>
              <Input
                name="playerName"
                value={form.playerName}
                onChange={handleChange}
                placeholder="Ex: Coutinho"
                className="bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Número do jogador
              </label>
              <Input
                name="playerNumber"
                value={form.playerNumber}
                onChange={handleChange}
                placeholder="Ex: 10"
                className="bg-white"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-8 justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow"
            >
              {loading ? 'Salvando...' : 'Salvar Produto'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/products')}
              className="font-semibold px-6 py-2 rounded border-gray-300"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

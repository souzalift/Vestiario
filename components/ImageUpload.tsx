'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';

// A interface agora aceita a propriedade 'team'
interface ImageUploadProps {
  images: string[];
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
  league?: string;
  team?: string; // <-- Propriedade adicionada
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 8,
  league,
  team, // <-- Propriedade adicionada
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    if (images.length + files.length > maxImages) {
      toast.error(`Você pode enviar no máximo ${maxImages} imagens.`);
      return;
    }

    setIsUploading(true);
    try {
      // Formata os caminhos para serem URL-friendly
      const leaguePath = league
        ? league.trim().toLowerCase().replace(/\s+/g, '-')
        : 'sem-liga';
      const teamPath = team
        ? team.trim().toLowerCase().replace(/\s+/g, '-')
        : 'sem-time';

      const uploadPromises = files.map((file) => {
        // O novo caminho agora é products/[league]/[team]/[timestamp]_[filename]
        const storageRef = ref(
          storage,
          `products/${leaguePath}/${teamPath}/${Date.now()}_${file.name}`,
        );
        return uploadBytes(storageRef, file).then((snapshot) =>
          getDownloadURL(snapshot.ref),
        );
      });

      const newUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...newUrls]);
      toast.success(`${files.length} imagem(ns) enviada(s) com sucesso!`);
    } catch (error) {
      console.error('Erro no upload de imagem:', error);
      toast.error('Falha no envio de uma ou mais imagens.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (imageUrlToRemove: string, index: number) => {
    if (!confirm('Tem a certeza de que quer remover esta imagem?')) return;

    try {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);

      const imageRef = ref(storage, imageUrlToRemove);
      await deleteObject(imageRef);

      toast.success('Imagem removida com sucesso.');
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.warn(
          'A imagem já não existia no armazenamento, mas foi removida da lista.',
        );
      } else {
        console.error('Erro ao remover imagem do armazenamento:', error);
        toast.error('Não foi possível remover a imagem do armazenamento.');
        onImagesChange(images);
      }
    }
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
      {images.map((url, index) => (
        <div key={index} className="relative aspect-square group">
          <Image
            src={url}
            alt={`Imagem do produto ${index + 1}`}
            fill
            className="object-cover rounded-lg border"
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleRemoveImage(url, index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {images.length < maxImages && (
        <Label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400" />
          )}
          <span className="text-xs text-gray-500 mt-1">
            {isUploading ? 'A enviar...' : 'Adicionar'}
          </span>
          <Input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </Label>
      )}
    </div>
  );
}

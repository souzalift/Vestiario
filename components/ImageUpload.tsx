'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useImageImport } from '@/hooks/useImageImport';
import {
  Upload,
  Link,
  X,
  Camera,
  Loader2,
  Plus,
  AlertCircle,
  Download,
  Globe,
  List,
} from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  className = '',
}: ImageUploadProps) {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadImage, validateImageUrl, uploading, uploadProgress } =
    useImageUpload();
  const {
    importImageFromUrl,
    importMultipleImages,
    importing,
    importProgress,
  } = useImageImport();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Máximo ${maxImages} imagens permitidas`);
      return;
    }

    const uploadPromises = Array.from(files).map((file) => uploadImage(file));

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url) => url !== null) as string[];

      if (validUrls.length > 0) {
        onImagesChange([...images, ...validUrls]);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao fazer upload das imagens');
    }

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlAdd = async () => {
    if (!newImageUrl.trim()) {
      toast.error('Digite uma URL válida');
      return;
    }

    if (images.length >= maxImages) {
      toast.error(`Máximo ${maxImages} imagens permitidas`);
      return;
    }

    if (images.includes(newImageUrl.trim())) {
      toast.error('Esta imagem já foi adicionada');
      return;
    }

    // Validar URL
    const isValid = await validateImageUrl(newImageUrl.trim());
    if (!isValid) {
      toast.error('URL de imagem inválida');
      return;
    }

    onImagesChange([...images, newImageUrl.trim()]);
    setNewImageUrl('');
    setShowUrlInput(false);
    toast.success('Imagem adicionada com sucesso!');
  };

  const handleUrlImport = async () => {
    if (!newImageUrl.trim()) {
      toast.error('Digite uma URL válida');
      return;
    }

    if (images.length >= maxImages) {
      toast.error(`Máximo ${maxImages} imagens permitidas`);
      return;
    }

    const importedUrl = await importImageFromUrl(newImageUrl.trim());
    if (importedUrl) {
      onImagesChange([...images, importedUrl]);
      setNewImageUrl('');
      setShowUrlInput(false);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkUrls.trim()) {
      toast.error('Digite as URLs das imagens');
      return;
    }

    const urls = bulkUrls
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urls.length === 0) {
      toast.error('Nenhuma URL válida encontrada');
      return;
    }

    if (images.length + urls.length > maxImages) {
      toast.error(
        `Máximo ${maxImages} imagens permitidas. Você tem ${images.length} e está tentando adicionar ${urls.length}.`,
      );
      return;
    }

    console.log(`Iniciando importação de ${urls.length} imagens...`);
    const importedUrls = await importMultipleImages(urls);

    if (importedUrls.length > 0) {
      onImagesChange([...images, ...importedUrls]);
      setBulkUrls('');
      setShowBulkImport(false);
      toast.success(`${importedUrls.length} imagens importadas com sucesso!`);
    } else {
      toast.error('Nenhuma imagem foi importada com sucesso');
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  const isProcessing = uploading || importing;
  const currentProgress = uploading ? uploadProgress : importProgress;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Botões de Upload */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing || images.length >= maxImages}
          className="flex items-center gap-2 border-gray-300 hover:bg-gray-100"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Upload do PC
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowUrlInput(!showUrlInput)}
          disabled={isProcessing || images.length >= maxImages}
          className="flex items-center gap-2 border-gray-300 hover:bg-gray-100"
        >
          <Link className="w-4 h-4" />
          URL Externa
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowBulkImport(!showBulkImport)}
          disabled={isProcessing || images.length >= maxImages}
          className="flex items-center gap-2 border-gray-300 hover:bg-gray-100"
        >
          <List className="w-4 h-4" />
          Importação em Lote
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Progresso */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {uploading ? 'Fazendo upload...' : 'Importando imagem...'}
            </span>
            <span className="text-gray-600">{currentProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Input de URL Simples */}
      {showUrlInput && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Label className="text-gray-700 font-medium">
            Adicionar Imagem por URL
          </Label>
          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              onKeyPress={(e) => e.key === 'Enter' && handleUrlAdd()}
              className="border-gray-200 focus:border-gray-400"
            />
            <Button
              type="button"
              onClick={handleUrlAdd}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              onClick={handleUrlImport}
              disabled={importing}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {importing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Globe className="w-4 h-4" />
            <span>
              <strong>Plus (+):</strong> Usar URL diretamente •
              <strong>Download:</strong> Importar para Firebase
            </span>
          </div>
        </div>
      )}

      {/* Importação em Lote */}
      {showBulkImport && (
        <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Label className="text-gray-700 font-medium">
            Importação em Lote (URLs)
          </Label>
          <Textarea
            value={bulkUrls}
            onChange={(e) => setBulkUrls(e.target.value)}
            placeholder={`https://exemplo.com/imagem1.jpg
https://exemplo.com/imagem2.jpg
https://exemplo.com/imagem3.jpg`}
            rows={6}
            className="border-gray-200 focus:border-gray-400"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Download className="w-4 h-4" />
              <span>
                Uma URL por linha • Todas serão importadas para o Firebase
              </span>
            </div>
            <Button
              type="button"
              onClick={handleBulkImport}
              disabled={importing || !bulkUrls.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Importar Todas
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <AlertCircle className="w-4 h-4" />
        <span>
          {images.length}/{maxImages} imagens • Máximo 5MB (upload) / 10MB
          (importação) • Formatos: JPEG, PNG, WebP
        </span>
      </div>

      {/* Lista de Imagens */}
      <div className="space-y-3">
        {images.map((imageUrl, index) => (
          <div key={index} className="relative group">
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
              {/* Preview da Imagem */}
              <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={imageUrl}
                  alt={`Imagem ${index + 1}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      '/placeholder-image.jpg';
                  }}
                />
              </div>

              {/* Info da Imagem */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <Badge className="bg-gray-900 hover:bg-gray-800 text-white">
                      Principal
                    </Badge>
                  )}
                  {imageUrl.includes('firebasestorage.googleapis.com') && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      Firebase
                    </Badge>
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    Imagem {index + 1}
                  </span>
                </div>
                <p className="text-xs text-gray-600 truncate max-w-[300px]">
                  {imageUrl}
                </p>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1">
                {/* Mover para cima */}
                {index > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => moveImage(index, index - 1)}
                    className="w-8 h-8 p-0 hover:bg-gray-100"
                    title="Mover para cima"
                  >
                    ↑
                  </Button>
                )}

                {/* Mover para baixo */}
                {index < images.length - 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => moveImage(index, index + 1)}
                    className="w-8 h-8 p-0 hover:bg-gray-100"
                    title="Mover para baixo"
                  >
                    ↓
                  </Button>
                )}

                {/* Remover */}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeImage(index)}
                  className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Remover imagem"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado vazio */}
      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Nenhuma imagem adicionada</p>
          <p className="text-sm text-gray-500">
            Faça upload, adicione URLs ou importe diretamente para o Firebase
          </p>
        </div>
      )}
    </div>
  );
}

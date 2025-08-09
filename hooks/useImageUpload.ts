'use client';

import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { toast } from 'sonner';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file: File, path: string = 'products'): Promise<string | null> => {
    if (!file) {
      toast.error('Nenhum arquivo selecionado');
      return null;
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato de arquivo não suportado. Use JPEG, PNG ou WebP');
      return null;
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Máximo 5MB');
      return null;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Gerar nome único para o arquivo
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `${path}/${fileName}`);

      // Simular progresso (Firebase não fornece progresso real para uploadBytes)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload do arquivo
      const snapshot = await uploadBytes(storageRef, file);

      // Obter URL de download
      const downloadURL = await getDownloadURL(snapshot.ref);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('Imagem enviada com sucesso!');

      return downloadURL;
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar imagem');
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extrair o path da URL do Firebase
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0];
      const decodedFileName = decodeURIComponent(fileName);

      const imageRef = ref(storage, decodedFileName);
      await deleteObject(imageRef);

      toast.success('Imagem removida com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      // Não mostrar erro se a imagem não existir no Storage (pode ser URL externa)
      return true;
    }
  };

  const validateImageUrl = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  return {
    uploadImage,
    deleteImage,
    validateImageUrl,
    uploading,
    uploadProgress,
  };
};
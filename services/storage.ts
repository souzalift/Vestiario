// services/storage.ts
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { storage } from '@/lib/firebase';

// Upload de imagem
export const uploadImage = async (
  file: File,
  path: string,
  fileName?: string
): Promise<string> => {
  try {
    const finalFileName = fileName || `${Date.now()}_${file.name}`;
    const imageRef = ref(storage, `${path}/${finalFileName}`);

    const snapshot = await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    throw error;
  }
};

// Upload múltiplo
export const uploadMultipleImages = async (
  files: FileList,
  path: string
): Promise<string[]> => {
  try {
    const uploadPromises = Array.from(files).map((file, index) =>
      uploadImage(file, path, `${Date.now()}_${index}_${file.name}`)
    );

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Erro ao fazer upload múltiplo:', error);
    throw error;
  }
};

// Deletar imagem
export const deleteImage = async (imageUrl: string) => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    throw error;
  }
};

// Listar imagens de uma pasta
export const listImages = async (path: string): Promise<string[]> => {
  try {
    const folderRef = ref(storage, path);
    const result = await listAll(folderRef);

    const urlPromises = result.items.map(item => getDownloadURL(item));
    return await Promise.all(urlPromises);
  } catch (error) {
    console.error('Erro ao listar imagens:', error);
    throw error;
  }
};
'use client';

import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { toast } from 'sonner';

export const useImageImport = () => {
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  // Lista de proxies CORS públicos (em ordem de preferência)
  const corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/',
  ];

  const importImageFromUrl = async (imageUrl: string, path: string = 'products'): Promise<string | null> => {
    if (!imageUrl.trim()) {
      toast.error('URL da imagem é obrigatória');
      return null;
    }

    setImporting(true);
    setImportProgress(0);

    try {
      // Validar se é uma URL válida
      let validUrl: URL;
      try {
        validUrl = new URL(imageUrl);
      } catch {
        toast.error('URL inválida');
        return null;
      }

      // Verificar se é uma URL de imagem
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
      const hasImageExtension = imageExtensions.some(ext =>
        validUrl.pathname.toLowerCase().includes(ext)
      );

      // Se não tem extensão de imagem na URL, ainda tenta fazer o download
      if (!hasImageExtension) {
        console.log('Aviso: URL pode não ser uma imagem, tentando mesmo assim...');
      }

      setImportProgress(20);

      let response: Response | null = null;
      let lastError: Error | null = null;

      // Primeiro, tentar sem proxy (para URLs que não têm problemas de CORS)
      console.log('Tentando download direto da imagem:', imageUrl);
      try {
        response = await fetch(imageUrl, {
          method: 'GET',
          headers: {
            'Accept': 'image/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          mode: 'cors',
          signal: AbortSignal.timeout(15000), // 15 segundos para tentativa direta
        });

        if (response.ok) {
          console.log('✅ Download direto bem-sucedido');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (directError: any) {
        console.log('❌ Download direto falhou:', directError.message);
        lastError = directError;
        response = null;

        // Se falhou, tentar com proxies CORS
        setImportProgress(30);

        for (let i = 0; i < corsProxies.length; i++) {
          const proxy = corsProxies[i];
          const proxiedUrl = proxy + encodeURIComponent(imageUrl);

          console.log(`Tentando proxy ${i + 1}/${corsProxies.length}:`, proxy);

          try {
            response = await fetch(proxiedUrl, {
              method: 'GET',
              headers: {
                'Accept': 'image/*',
              },
              signal: AbortSignal.timeout(20000), // 20 segundos para proxy
            });

            if (response.ok) {
              console.log(`✅ Proxy ${i + 1} bem-sucedido:`, proxy);
              break;
            } else {
              console.log(`❌ Proxy ${i + 1} falhou: HTTP ${response.status}`);
              response = null;
            }
          } catch (proxyError: any) {
            console.log(`❌ Proxy ${i + 1} erro:`, proxyError.message);
            lastError = proxyError;
            response = null;
          }
        }
      }

      // Se nenhum método funcionou
      if (!response || !response.ok) {
        throw lastError || new Error('Todos os métodos de download falharam');
      }

      setImportProgress(50);

      // Verificar se o content-type é uma imagem
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        // Para proxies, às vezes o content-type vem como text/plain
        console.warn('Content-Type suspeito, mas continuando:', contentType);
      }

      // Converter para blob
      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('Arquivo de imagem está vazio');
      }

      // Verificar tamanho (máximo 10MB para importação)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (blob.size > maxSize) {
        throw new Error('Imagem muito grande. Máximo 10MB para importação');
      }

      // Verificar se realmente é uma imagem analisando os primeiros bytes
      const arrayBuffer = await blob.slice(0, 12).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Verificar assinaturas de arquivo de imagem
      const isJPEG = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8;
      const isPNG = uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47;
      const isWebP = uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && uint8Array[10] === 0x42 && uint8Array[11] === 0x50;
      const isGIF = uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46;

      if (!isJPEG && !isPNG && !isWebP && !isGIF) {
        throw new Error('O arquivo baixado não é uma imagem válida');
      }

      setImportProgress(70);

      // Gerar nome único para o arquivo
      const timestamp = new Date().getTime();
      const urlPath = validUrl.pathname;
      const originalName = urlPath.split('/').pop() || 'imported-image';
      const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');

      // Determinar extensão baseada na assinatura do arquivo
      let extension = '';
      let mimeType = '';

      if (isJPEG) {
        extension = '.jpg';
        mimeType = 'image/jpeg';
      } else if (isPNG) {
        extension = '.png';
        mimeType = 'image/png';
      } else if (isWebP) {
        extension = '.webp';
        mimeType = 'image/webp';
      } else if (isGIF) {
        extension = '.gif';
        mimeType = 'image/gif';
      } else {
        extension = '.jpg'; // fallback
        mimeType = 'image/jpeg';
      }

      const fileName = `imported_${timestamp}_${cleanName}${extension}`;
      const storageRef = ref(storage, `${path}/${fileName}`);

      setImportProgress(80);

      // Upload para o Firebase Storage
      console.log('Fazendo upload para Firebase Storage...');
      const snapshot = await uploadBytes(storageRef, blob, {
        contentType: mimeType,
      });

      // Obter URL de download
      const downloadURL = await getDownloadURL(snapshot.ref);

      setImportProgress(100);

      toast.success('Imagem importada com sucesso!');
      console.log('Imagem importada:', downloadURL);

      return downloadURL;

    } catch (error: any) {
      console.error('Erro ao importar imagem:', error);

      // Mensagens de erro específicas
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        toast.error('Timeout: A importação demorou muito. Tente uma imagem menor.');
      } else if (error.message.includes('HTTP 403')) {
        toast.error('Acesso negado: O site não permite download da imagem.');
      } else if (error.message.includes('HTTP 404')) {
        toast.error('Imagem não encontrada no URL fornecido.');
      } else if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        toast.error('Erro de CORS: Não foi possível baixar a imagem. Tente salvar a imagem localmente e fazer upload.');
      } else if (error.message.includes('network')) {
        toast.error('Erro de rede: Verifique sua conexão e tente novamente.');
      } else if (error.message.includes('não é uma imagem válida')) {
        toast.error('O arquivo baixado não é uma imagem válida.');
      } else if (error.message.includes('Todos os métodos')) {
        toast.error('Não foi possível baixar a imagem. Tente uma URL diferente ou faça upload local.');
      } else {
        toast.error(`Erro ao importar imagem: ${error.message}`);
      }

      return null;
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };

  const importMultipleImages = async (urls: string[], path: string = 'products'): Promise<string[]> => {
    const results: string[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i].trim();
      if (!url) continue;

      console.log(`Importando imagem ${i + 1}/${urls.length}: ${url}`);

      // Mostrar progresso no toast
      toast.loading(`Importando ${i + 1}/${urls.length} imagens...`, {
        id: 'bulk-import'
      });

      const result = await importImageFromUrl(url, path);
      if (result) {
        results.push(result);
        successCount++;
      } else {
        errorCount++;
      }

      // Pausa entre importações para não sobrecarregar
      if (i < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos entre tentativas
      }
    }

    // Dismiss loading toast
    toast.dismiss('bulk-import');

    // Toast final
    if (successCount > 0) {
      toast.success(`✅ ${successCount} imagens importadas com sucesso!`);
    }
    if (errorCount > 0) {
      toast.error(`❌ ${errorCount} imagens falharam na importação.`);
    }

    return results;
  };

  // Função para testar uma URL antes da importação
  const testImageUrl = async (imageUrl: string): Promise<boolean> => {
    try {
      const response = await fetch(imageUrl, {
        method: 'HEAD', // Apenas cabeçalhos
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  return {
    importImageFromUrl,
    importMultipleImages,
    testImageUrl,
    importing,
    importProgress,
  };
};
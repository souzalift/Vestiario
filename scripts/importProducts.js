// scripts/importProducts.js
const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
} = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyBETNStgJY8IGTg1L9Pipng4XdpZysGVLc',
  authDomain: 'o-vestiario-67951.firebaseapp.com',
  projectId: 'o-vestiario-67951',
  storageBucket: 'o-vestiario-67951.firebasestorage.app',
  messagingSenderId: '423606869059',
  appId: '1:423606869059:web:644f5e9a05bef34f3348f6',
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para gerar slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
};

// Verificar se produto já existe e obter dados existentes
const getExistingProduct = async (slug) => {
  try {
    const docRef = doc(db, 'products', slug);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.log(`Erro ao verificar produto existente: ${error}`);
    return null;
  }
};

// Função para verificar conexão com Firebase
const testFirebaseConnection = async () => {
  try {
    console.log('🔍 Testando conexão com Firebase...');

    // Tentar criar um documento de teste
    const testRef = doc(db, 'test', 'connection');
    await setDoc(testRef, {
      timestamp: new Date(),
      message: 'Teste de conexão',
    });

    console.log('✅ Conexão com Firebase OK!');

    // Limpar documento de teste
    const { deleteDoc } = require('firebase/firestore');
    await deleteDoc(testRef);

    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com Firebase:', error.message);

    if (error.code === 'permission-denied') {
      console.log('\n🚨 ERRO DE PERMISSÃO DETECTADO!');
      console.log('📝 Para resolver, configure as regras do Firestore:');
      console.log(
        '1. Acesse: https://console.firebase.google.com/project/o-vestiario-67951/firestore/rules',
      );
      console.log('2. Cole as regras temporárias:');
      console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read, write: if true;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
      `);
      console.log('3. Clique em "Publish"');
      console.log('4. Execute o script novamente');
    }

    return false;
  }
};

// Função principal de importação
const importProducts = async (jsonFilePath) => {
  console.log('🚀 Iniciando importação de produtos para o Firebase...');
  console.log('🔄 MODO: SOBRESCREVER produtos existentes');

  // Verificar se arquivo foi fornecido
  if (!jsonFilePath) {
    console.error('❌ Erro: Arquivo JSON é obrigatório!');
    console.log('💡 Uso: node scripts/importProducts.js <arquivo.json>');
    console.log('📝 Exemplo: node scripts/importProducts.js products.json');
    throw new Error('Arquivo JSON não fornecido');
  }

  // Verificar se arquivo existe
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`❌ Erro: Arquivo "${jsonFilePath}" não encontrado!`);
    console.log(
      `📁 Verifique se o arquivo existe no diretório atual: ${process.cwd()}`,
    );
    throw new Error(`Arquivo não encontrado: ${jsonFilePath}`);
  }

  // Testar conexão primeiro
  const connectionOk = await testFirebaseConnection();
  if (!connectionOk) {
    throw new Error(
      'Falha na conexão com Firebase. Verifique as regras de segurança.',
    );
  }

  try {
    // Ler arquivo JSON
    console.log(`📁 Lendo arquivo: ${jsonFilePath}`);
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf-8');

    let productsData;
    try {
      productsData = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError.message);
      throw new Error(`Arquivo JSON inválido: ${parseError.message}`);
    }

    if (!Array.isArray(productsData)) {
      throw new Error('O arquivo JSON deve conter um array de produtos');
    }

    if (productsData.length === 0) {
      console.log('⚠️  Arquivo JSON está vazio');
      return { imported: 0, updated: 0, errors: 0, details: [] };
    }

    console.log(`📦 Encontrados ${productsData.length} produtos para importar`);

    const results = {
      imported: 0,
      updated: 0,
      errors: 0,
      details: [],
    };

    // Loop pelos produtos
    for (let index = 0; index < productsData.length; index++) {
      const productData = productsData[index];

      try {
        console.log(
          `\n📝 Processando produto ${index + 1}/${productsData.length}: ${
            productData.title || 'Sem título'
          }`,
        );

        // Validar dados obrigatórios
        if (!productData.title || !productData.price || !productData.category) {
          throw new Error(
            'Campos obrigatórios faltando: title, price ou category',
          );
        }

        const slug = generateSlug(productData.title);
        console.log(`🔗 Slug gerado: ${slug}`);

        // Verificar se produto já existe
        let existingProduct = null;
        try {
          existingProduct = await getExistingProduct(slug);
        } catch (error) {
          if (error.code === 'permission-denied') {
            console.log('❌ Erro de permissão ao verificar produto existente');
            throw error;
          }
          // Continuar se for outro tipo de erro
          console.log(
            `⚠️  Aviso: Não foi possível verificar se produto existe: ${error.message}`,
          );
        }

        const isUpdate = existingProduct !== null;

        if (isUpdate) {
          console.log(
            `🔄 Produto existente será atualizado: ${productData.title}`,
          );
        } else {
          console.log(`✨ Novo produto será criado: ${productData.title}`);
        }

        // Preparar dados do produto
        const product = {
          ...productData,
          slug,
          updatedAt: new Date(),
          // Preservar dados existentes ou criar novos
          createdAt: existingProduct?.createdAt || new Date(),
          views: existingProduct?.views || Math.floor(Math.random() * 100 + 50),
          rating:
            existingProduct?.rating ||
            Number((Math.random() * 1.5 + 3.5).toFixed(1)),
          reviewCount:
            existingProduct?.reviewCount || Math.floor(Math.random() * 25 + 5),
        };

        // Tentar salvar com retry
        let attempts = 0;
        const maxAttempts = 3;
        let success = false;

        while (attempts < maxAttempts && !success) {
          try {
            attempts++;
            console.log(`💾 Tentativa ${attempts}/${maxAttempts} de salvar...`);

            const docRef = doc(db, 'products', slug);
            await setDoc(docRef, product, { merge: false }); // Sobrescrever completamente

            if (isUpdate) {
              console.log(
                `🔄 Produto atualizado: ${product.title} (ID: ${slug})`,
              );
              results.updated++;
              results.details.push({
                title: productData.title,
                status: 'updated',
                message: 'Produto atualizado com sucesso',
              });
            } else {
              console.log(`✅ Produto criado: ${product.title} (ID: ${slug})`);
              results.imported++;
              results.details.push({
                title: productData.title,
                status: 'created',
                message: 'Produto criado com sucesso',
              });
            }

            success = true;
          } catch (importError) {
            console.log(
              `⚠️  Tentativa ${attempts} falhou: ${importError.message}`,
            );

            if (importError.code === 'permission-denied') {
              throw importError; // Não tentar novamente em erro de permissão
            }

            if (attempts < maxAttempts) {
              const delay = attempts * 1000; // Aumentar delay a cada tentativa
              console.log(
                `⏳ Aguardando ${delay}ms antes da próxima tentativa...`,
              );
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        }

        if (!success) {
          throw new Error(`Falhou após ${maxAttempts} tentativas`);
        }

        // Pausa entre produtos
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.error(
          `❌ Erro ao processar produto "${
            productData.title || 'Sem título'
          }":`,
          error.message,
        );

        // Se for erro de permissão, parar tudo
        if (error.code === 'permission-denied') {
          console.log('\n🛑 PARANDO IMPORTAÇÃO - Erro de permissão!');
          console.log('Configure as regras do Firestore e tente novamente.');
          throw error;
        }

        results.errors++;
        results.details.push({
          title: productData.title || 'Produto sem título',
          status: 'error',
          message: error.message || 'Erro desconhecido',
        });
      }
    }

    // Relatório final
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log('='.repeat(50));
    console.log(`✅ Produtos criados: ${results.imported}`);
    console.log(`🔄 Produtos atualizados: ${results.updated}`);
    console.log(`❌ Erros encontrados: ${results.errors}`);
    console.log(`📦 Total processados: ${productsData.length}`);
    console.log('='.repeat(50));

    if (results.errors > 0) {
      console.log('\n❌ DETALHES DOS ERROS:');
      results.details
        .filter((d) => d.status === 'error')
        .forEach((detail, index) => {
          console.log(`  ${index + 1}. ${detail.title}`);
          console.log(`     Erro: ${detail.message}`);
        });
    }

    if (results.imported > 0) {
      console.log('\n✨ PRODUTOS CRIADOS:');
      results.details
        .filter((d) => d.status === 'created')
        .forEach((detail, index) => {
          console.log(`  ${index + 1}. ${detail.title}`);
        });
    }

    if (results.updated > 0) {
      console.log('\n🔄 PRODUTOS ATUALIZADOS:');
      results.details
        .filter((d) => d.status === 'updated')
        .forEach((detail, index) => {
          console.log(`  ${index + 1}. ${detail.title}`);
        });
    }

    console.log('\n🎉 Importação concluída!');

    if (results.imported > 0 || results.updated > 0) {
      console.log('\n🔗 Acesse o Firebase Console para verificar:');
      console.log(
        'https://console.firebase.google.com/project/o-vestiario-67951/firestore/data',
      );
    }

    return results;
  } catch (error) {
    console.error('💥 Erro crítico na importação:', error);
    throw error;
  }
};

// Executar script se chamado diretamente
if (require.main === module) {
  const filePath = process.argv[2]; // Arquivo JSON como argumento

  importProducts(filePath)
    .then((results) => {
      console.log('\n🏁 Script finalizado!');
      console.log(
        `📈 Resumo: ${results.imported} criados, ${results.updated} atualizados, ${results.errors} erros`,
      );

      // Sair com código de erro se houve falhas
      const exitCode = results.errors > 0 ? 1 : 0;
      process.exit(exitCode);
    })
    .catch((error) => {
      console.error('\n💥 Script falhou completamente:', error.message);
      process.exit(1);
    });
}

module.exports = { importProducts };

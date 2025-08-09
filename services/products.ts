// services/products.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  Query,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  sizes: string[];
  featured: boolean;
  tags: string[];
  brand?: string;
  league?: string;
  season?: string;
  playerName?: string;
  playerNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  views: number;
  rating: number;
  reviewCount: number;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  featured?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating';
}

// Buscar produtos com filtros avançados
export const getProducts = async (
  filters: ProductFilters = {},
  limitCount: number = 20,
  lastDoc?: QueryDocumentSnapshot
) => {
  try {
    // Iniciar com a coleção base
    const baseCollection = collection(db, 'products');
    let q: Query<DocumentData, DocumentData> = baseCollection;

    // Aplicar filtros
    const queryConstraints = [];

    // Filtro por categoria
    if (filters.category && filters.category !== 'Todos') {
      queryConstraints.push(where('category', '==', filters.category));
    }

    // Filtro por destaque
    if (filters.featured) {
      queryConstraints.push(where('featured', '==', true));
    }

    // Ordenação
    switch (filters.sortBy) {
      case 'price_asc':
        queryConstraints.push(orderBy('price', 'asc'));
        break;
      case 'price_desc':
        queryConstraints.push(orderBy('price', 'desc'));
        break;
      case 'newest':
        queryConstraints.push(orderBy('createdAt', 'desc'));
        break;
      case 'popular':
        queryConstraints.push(orderBy('views', 'desc'));
        break;
      case 'rating':
        queryConstraints.push(orderBy('rating', 'desc'));
        break;
      default:
        queryConstraints.push(orderBy('createdAt', 'desc'));
    }

    // Paginação
    if (lastDoc) {
      queryConstraints.push(startAfter(lastDoc));
    }

    // Limite
    queryConstraints.push(limit(limitCount));

    // Construir query final
    q = query(baseCollection, ...queryConstraints);

    const querySnapshot = await getDocs(q);
    let products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Product[];

    // Filtros que não podem ser feitos no Firestore
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      products = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        product.brand?.toLowerCase().includes(searchTerm) ||
        product.playerName?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.minPrice !== undefined) {
      products = products.filter(product => product.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      products = products.filter(product => product.price <= filters.maxPrice!);
    }

    if (filters.sizes && filters.sizes.length > 0) {
      products = products.filter(product =>
        filters.sizes!.some(size => product.sizes.includes(size))
      );
    }

    return {
      products,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === limitCount,
    };
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

// Buscar produto por ID
export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Incrementar visualizações
      await updateDoc(docRef, {
        views: (docSnap.data().views || 0) + 1,
      });

      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    throw error;
  }
};

// Buscar produto por slug
export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const baseCollection = collection(db, 'products');
    const q = query(baseCollection, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];

      // Incrementar visualizações
      await updateDoc(docSnapshot.ref, {
        views: (docSnapshot.data().views || 0) + 1,
      });

      return {
        id: docSnapshot.id,
        ...docSnapshot.data(),
        createdAt: docSnapshot.data().createdAt?.toDate(),
        updatedAt: docSnapshot.data().updatedAt?.toDate(),
      } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar produto por slug:', error);
    throw error;
  }
};

// Buscar produtos relacionados
export const getRelatedProducts = async (product: Product, limitCount: number = 4) => {
  try {
    // Buscar produtos da mesma categoria, excluindo o produto atual
    const baseCollection = collection(db, 'products');
    const q = query(
      baseCollection,
      where('category', '==', product.category),
      orderBy('views', 'desc'),
      limit(limitCount + 5) // Pegar alguns extras para filtrar
    );

    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Product[];

    // Filtrar o produto atual e limitar
    return products
      .filter(p => p.id !== product.id)
      .slice(0, limitCount);
  } catch (error) {
    console.error('Erro ao buscar produtos relacionados:', error);
    return [];
  }
};

// Buscar produtos em destaque
export const getFeaturedProducts = async (limitCount: number = 8) => {
  try {
    const baseCollection = collection(db, 'products');
    const q = query(
      baseCollection,
      where('featured', '==', true),
      orderBy('views', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Product[];
  } catch (error) {
    console.error('Erro ao buscar produtos em destaque:', error);
    return [];
  }
};

// Buscar categorias disponíveis
export const getCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const categories = new Set<string>();

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.category) {
        categories.add(data.category);
      }
    });

    return Array.from(categories).sort();
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
};

// Criar produto (admin)
export const createProduct = async (productData: Omit<Product, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      rating: 0,
      reviewCount: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    throw error;
  }
};

// Atualizar produto (admin)
export const updateProduct = async (id: string, productData: Partial<Product>) => {
  try {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
      ...productData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error;
  }
};

// Deletar produto (admin)
export const deleteProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    throw error;
  }
};

// Buscar produtos por texto (busca avançada)
export const searchProducts = async (searchTerm: string, limitCount: number = 20) => {
  try {
    const baseCollection = collection(db, 'products');
    const q = query(baseCollection, limit(limitCount * 2));
    const querySnapshot = await getDocs(q);

    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Product[];

    // Filtrar e ordenar por relevância
    const searchTermLower = searchTerm.toLowerCase();
    const filteredProducts = products
      .filter(product => {
        const titleMatch = product.title.toLowerCase().includes(searchTermLower);
        const descMatch = product.description.toLowerCase().includes(searchTermLower);
        const tagsMatch = product.tags.some(tag =>
          tag.toLowerCase().includes(searchTermLower)
        );
        const brandMatch = product.brand?.toLowerCase().includes(searchTermLower);
        const playerMatch = product.playerName?.toLowerCase().includes(searchTermLower);

        return titleMatch || descMatch || tagsMatch || brandMatch || playerMatch;
      })
      .sort((a, b) => {
        // Ordenar por relevância (título > tags > descrição)
        const aTitle = a.title.toLowerCase().includes(searchTermLower);
        const bTitle = b.title.toLowerCase().includes(searchTermLower);

        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;

        return b.views - a.views; // Por popularidade
      })
      .slice(0, limitCount);

    return filteredProducts;
  } catch (error) {
    console.error('Erro na busca:', error);
    throw error;
  }
};

// Re-exportar o tipo para corrigir o erro de importação
export { QueryDocumentSnapshot } from 'firebase/firestore';
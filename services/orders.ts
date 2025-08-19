// services/orders.ts
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

// Tipo para cada item dentro do pedido
export interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
  basePrice: number;
  image: string;
  size: string;
  team: string;
  productSlug: string;
  customization: { name?: string; number?: string } | null;
  customizationFee: number;
}

// Tipo para o cliente
export interface Customer {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  document: string;
}

// Tipo para o endereço
export interface Address {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

// Tipo principal para o Pedido completo
export interface Order {
  total: number;
  id: string; // ID do documento do Firestore
  orderNumber: string;
  status: 'pendente' | 'pago' | 'enviado' | 'entregue' | 'cancelado'; // Ajuste os status conforme necessário
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded'; // Adicionado para suportar o campo paymentStatus
  totalPrice: number;
  subtotal: number;
  shippingPrice: number;
  totalCustomizationFee: number;
  notes: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  customer: Customer;
  address: Address;
  items: OrderItem[];
}

// Gera um ID do pedido no padrão PED-YYYYMMDD-XXXXXX
export function generateOrderNumber() {
  const date = new Date();
  const ddmmyyyy = date
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `V-${ddmmyyyy}-${random}`;
}

// Criar pedido
export const createOrder = async (orderData: Omit<Order, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
};

// Buscar pedidos do usuário
export const getUserOrders = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Order[];
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }
};

// Atualizar status do pedido
export const updateOrderStatus = async (
  orderId: string,
  status: Order['status'],
  paymentStatus?: Order['paymentStatus']
) => {
  try {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    throw error;
  }
};

// Buscar todos os pedidos (admin)
export const getAllOrders = async () => {
  try {
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Order[];
  } catch (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    throw error;
  }
};


export const getOrderById = async (id: string): Promise<Order | null> => {
  const docRef = doc(db, 'orders', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();

  // Retorne todos os campos obrigatórios da interface Order
  return {
    id: docSnap.id,
    orderNumber: data.orderNumber ?? '',
    status: data.status ?? 'pending',
    total: data.total ?? 0,
    totalPrice: data.totalPrice ?? 0,
    subtotal: data.subtotal ?? 0,
    shippingPrice: data.shippingPrice ?? 0,
    totalCustomizationFee: data.totalCustomizationFee ?? 0,
    notes: data.notes ?? '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    customer: data.customer ?? {
      name: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      document: '',
    },
    address: data.address ?? {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
    },
    items: data.items ?? [],
  };
};


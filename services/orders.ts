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
  Timestamp, // Importar Timestamp do Firebase
  DocumentSnapshot, // Importar tipo do DocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Interfaces (sem alterações, mas ajustaremos o tipo de data abaixo)
export interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
  basePrice: number;
  image: string;
  size: string;
  team?: string;
  productSlug?: string;
  customization: { name?: string; number?: string } | null;
  customizationFee: number;
}

export interface Customer {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  document: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

// Tipo principal para o Pedido, usando 'Date' para a aplicação
export interface Order {
  id: string;
  orderNumber: string;
  status: 'pendente' | 'pago' | 'enviado' | 'entregue' | 'cancelado';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  total: number;
  totalPrice: number;
  subtotal: number;
  shippingPrice: number;
  totalCustomizationFee: number;
  notes?: string;
  createdAt: Date; // Usaremos o tipo Date do JavaScript
  updatedAt: Date; // Usaremos o tipo Date do JavaScript
  customer: Customer;
  address: Address;
  items: OrderItem[];
  userId?: string; // Adicionado para a busca de pedidos do usuário
  trackingCode?: string;
}

export interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  paidOrdersCount: number;
  averageTicket: number;
  recentOrders: Order[];
}

// Tipo para os dados que vêm do frontend para criar um pedido
type CreateOrderData = Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'userId'> & {
  userId: string;
};


// Gera um ID do pedido no padrão V-XXXXXX
export function generateOrderNumber() {
  const randomDigits = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0'); // garante sempre 6 dígitos
  return `V-${randomDigits}`;
}

// --- MELHORIA: Função centralizada para transformar dados do Firestore ---
const transformOrderDocument = (doc: DocumentSnapshot): Order => {
  const data = doc.data()!; // '!' pois sabemos que o documento existe

  // Converte Timestamps do Firestore para objetos Date do JavaScript
  const createdAt = (data.createdAt as Timestamp)?.toDate() || new Date();
  const updatedAt = (data.updatedAt as Timestamp)?.toDate() || new Date();

  return {
    id: doc.id,
    orderNumber: data.orderNumber || '',
    status: data.status || 'pendente',
    paymentStatus: data.paymentStatus || 'pending',
    total: data.total || 0,
    totalPrice: data.totalPrice || 0,
    subtotal: data.subtotal || 0,
    shippingPrice: data.shippingPrice || 0,
    totalCustomizationFee: data.totalCustomizationFee || 0,
    notes: data.notes || '',
    customer: data.customer || {},
    address: data.address || {},
    items: data.items || [],
    userId: data.userId || '',
    trackingCode: data.trackingCode || '',
    createdAt,
    updatedAt,
  };
};

// Criar pedido
export const createOrder = async (orderData: CreateOrderData): Promise<string> => {
  try {
    if (!orderData.userId) {
      throw new Error('O campo userId é obrigatório para criar um pedido.');
    }

    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw new Error('Não foi possível criar o pedido.');
  }
};

// Buscar um pedido pelo ID
export const getOrderById = async (id: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, 'orders', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    return transformOrderDocument(docSnap); // Usa a função centralizada
  } catch (error) {
    console.error('Erro ao buscar pedido por ID:', error);
    throw new Error('Não foi possível buscar o pedido.');
  }
};

// Buscar pedidos de um usuário específico
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(transformOrderDocument); // Usa a função centralizada
  } catch (error) {
    console.error('Erro ao buscar pedidos do usuário:', error);
    throw new Error('Não foi possível buscar os pedidos do usuário.');
  }
};

// Buscar todos os pedidos (para o painel de admin)
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(transformOrderDocument); // Usa a função centralizada
  } catch (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    throw new Error('Não foi possível buscar todos os pedidos.');
  }
};

// Atualizar status do pedido
export const updateOrderStatus = async (
  orderId: string,
  status: Order['status'],
  paymentStatus?: Order['paymentStatus']
): Promise<void> => {
  try {
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    throw new Error('Não foi possível atualizar o status do pedido.');
  }
};

// NOVA FUNÇÃO: Atualizar dados de um pedido
export const updateOrder = async (orderId: string, data: Partial<Omit<Order, 'id' | 'createdAt'>>): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      ...data,
      updatedAt: Timestamp.now(), // Atualiza sempre a data de modificação
    });
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    throw new Error('Não foi possível atualizar o pedido.');
  }
};

export const getOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('orderNumber', '==', orderNumber)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null; // Nenhum pedido encontrado com este número
    }

    // Retorna o primeiro documento encontrado (deve ser único)
    const orderDoc = querySnapshot.docs[0];
    return transformOrderDocument(orderDoc); // Reutiliza sua função de transformação

  } catch (error) {
    console.error('Erro ao buscar pedido por número:', error);
    throw new Error('Não foi possível buscar o pedido.');
  }
};

// Busca e calcula os dados para o painel de administração
export const getDashboardData = async (orders: { id: string; }[]) => {
  try {
    const ordersRef = collection(db, 'orders');

    // 1. Busca todos os pedidos para a contagem total e os recentes
    const allOrdersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
    const allOrdersSnapshot = await getDocs(allOrdersQuery);
    const allOrders = allOrdersSnapshot.docs.map(transformOrderDocument);
    const totalOrders = allOrders.length;
    const recentOrders = allOrders.slice(0, 5);

    // 2. Filtra apenas os pedidos pagos para os cálculos de receita
    const paidOrders = allOrders.filter(order => order.paymentStatus === 'paid');
    const paidOrdersCount = paidOrders.length;

    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);

    const averageTicket = paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0;

    // 3. Calcula os produtos mais vendidos
    const productSales: { [key: string]: { title: string; count: number } } = {};
    paidOrders.forEach(order => {
      order.items.forEach(item => {
        if (productSales[item.id]) {
          productSales[item.id].count += item.quantity;
        } else {
          productSales[item.id] = {
            title: item.title,
            count: item.quantity,
          };
        }
      });
    });

    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRevenue,
      paidOrdersCount,
      totalOrders,
      averageTicket,
      recentOrders,
      topSellingProducts, // Adicionado
    };

  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    throw new Error("Não foi possível carregar os dados do dashboard.");
  }
};
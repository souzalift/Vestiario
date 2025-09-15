// services/orders.admin.ts
import admin from 'firebase-admin';

// Inicialização do Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Interfaces de pedido
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
  birthDate: string;
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
  createdAt: Date;
  updatedAt: Date;
  customer: Customer;
  address: Address;
  items: OrderItem[];
  userId?: string;
  trackingCode?: string;
}

export interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  paidOrdersCount: number;
  averageTicket: number;
  recentOrders: Order[];
}

// Tipo para dados de criação
type CreateOrderData = Omit<Order, 'id' | 'createdAt' | 'updatedAt'> & { userId: string };

// Função para gerar número de pedido
export function generateOrderNumber() {
  const randomDigits = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  return `V-${randomDigits}`;
}

// Transformar documento em Order
const transformOrderDocument = (doc: admin.firestore.DocumentSnapshot): Order => {
  const data = doc.data()!;
  const createdAt = (data.createdAt as admin.firestore.Timestamp)?.toDate() || new Date();
  const updatedAt = (data.updatedAt as admin.firestore.Timestamp)?.toDate() || new Date();

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

// --- Funções CRUD ---

// Criar pedido
export const createOrder = async (orderData: CreateOrderData): Promise<string> => {
  const docRef = await db.collection('orders').add({
    ...orderData,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  });
  return docRef.id;
};

// Buscar pedido por ID
export const getOrderById = async (id: string): Promise<Order | null> => {
  const docRef = db.collection('orders').doc(id);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return null;
  return transformOrderDocument(docSnap);
};

// Buscar pedido por número
export const getOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
  const q = db.collection('orders').where('orderNumber', '==', orderNumber);
  const snapshot = await q.get();
  if (snapshot.empty) return null;
  return transformOrderDocument(snapshot.docs[0]);
};

// Buscar todos pedidos
export const getAllOrders = async (): Promise<Order[]> => {
  const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(transformOrderDocument);
};

// Buscar pedidos de um usuário
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const snapshot = await db.collection('orders')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(transformOrderDocument);
};

// Atualizar status
export const updateOrderStatus = async (
  orderId: string,
  status: Order['status'],
  paymentStatus?: Order['paymentStatus']
) => {
  const updateData: any = {
    status,
    updatedAt: admin.firestore.Timestamp.now(),
  };
  if (paymentStatus) updateData.paymentStatus = paymentStatus;

  await db.collection('orders').doc(orderId).update(updateData);
};

// Atualizar qualquer campo do pedido
export const updateOrder = async (orderId: string, data: Partial<Omit<Order, 'id' | 'createdAt'>>) => {
  await db.collection('orders').doc(orderId).update({
    ...data,
    updatedAt: admin.firestore.Timestamp.now(),
  });
};

// Dashboard
export const getDashboardData = async () => {
  const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
  const allOrders = snapshot.docs.map(transformOrderDocument);

  const totalOrders = allOrders.length;
  const recentOrders = allOrders.slice(0, 5);
  const paidOrders = allOrders.filter(o => o.paymentStatus === 'paid');
  const paidOrdersCount = paidOrders.length;
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const averageTicket = paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0;

  // Produtos mais vendidos
  const productSales: { [key: string]: { title: string; count: number } } = {};
  paidOrders.forEach(order => {
    order.items.forEach(item => {
      if (productSales[item.id]) productSales[item.id].count += item.quantity;
      else productSales[item.id] = { title: item.title, count: item.quantity };
    });
  });
  const topSellingProducts = Object.values(productSales)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { totalRevenue, paidOrdersCount, totalOrders, averageTicket, recentOrders, topSellingProducts };
};

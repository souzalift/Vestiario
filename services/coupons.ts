// services/coupons.ts
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  DocumentSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Coupon {
  id: string;
  code: string; // ex: BEMVINDO10
  type: 'percentage' | 'fixed'; // Desconto percentual ou de valor fixo
  value: number; // O valor do desconto (ex: 10 para 10% ou 20 para R$ 20,00)
  isActive: boolean;
  expiryDate?: Date;
  createdAt: Date;
}

// Função para transformar o documento do Firestore no tipo Coupon
const transformCouponDocument = (doc: DocumentSnapshot): Coupon => {
  const data = doc.data()!;
  return {
    id: doc.id,
    code: data.code,
    type: data.type,
    value: data.value,
    isActive: data.isActive,
    expiryDate: (data.expiryDate as Timestamp)?.toDate(),
    createdAt: (data.createdAt as Timestamp)?.toDate(),
  };
};


export const getCouponByCode = async (code: string): Promise<Coupon | null> => {
  try {
    const couponRef = doc(db, 'coupons', code.toUpperCase());
    const docSnap = await getDoc(couponRef);
    if (!docSnap.exists()) {
      return null;
    }
    return transformCouponDocument(docSnap);
  } catch (error) {
    console.error("Erro ao buscar cupom:", error);
    throw new Error('Não foi possível verificar o cupom.');
  }
};


export const getAllCoupons = async (): Promise<Coupon[]> => {
  try {
    const q = query(collection(db, 'coupons'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(transformCouponDocument);
  } catch (error) {
    console.error("Erro ao buscar todos os cupões:", error);
    throw new Error('Não foi possível carregar os cupões.');
  }
};

export const createCoupon = async (data: Omit<Coupon, 'id' | 'createdAt'>) => {
  try {
    const couponRef = doc(db, 'coupons', data.code.toUpperCase());
    await setDoc(couponRef, {
      ...data,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Erro ao criar cupom:", error);
    throw new Error('Não foi possível criar o cupom.');
  }
};

export const deleteCouponByCode = async (code: string): Promise<boolean> => {
  try {
    const couponRef = doc(db, 'coupons', code.toUpperCase());
    const docSnap = await getDoc(couponRef);
    if (!docSnap.exists()) {
      return false;
    }
    await deleteDoc(couponRef);
    return true;
  } catch (error) {
    console.error("Erro ao deletar cupom:", error);
    throw new Error('Não foi possível deletar o cupom.');
  }
};

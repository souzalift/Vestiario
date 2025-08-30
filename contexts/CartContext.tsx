'use client';

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { toast } from 'sonner';
import { calculateShipping } from '@/lib/shipping';
import type { Coupon } from '@/services/coupons';

// Interfaces para os tipos de dados
export interface CartItem {
  id: string;
  productId: string;
  productSlug?: string;
  title: string;
  price: number;
  basePrice: number;
  customizationFee: number;
  sizeFee: number;
  image: string;
  size: string;
  quantity: number;
  customization?: { name?: string; number?: string } | null;
  team?: string;
  brand?: string;
  category?: string;
}

interface ProductToAdd {
  productId: string;
  productSlug?: string;
  title: string;
  basePrice: number;
  image: string;
  team?: string;
  brand?: string;
  category?: string;
}

interface AddOptions {
  size: string;
  quantity: number;
  customization?: { name?: string; number?: string } | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: ProductToAdd, options: AddOptions) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  shippingPrice: number;
  totalCustomizationFee: number;
  totalPrice: number;
  coupon: Coupon | null;
  discountAmount: number;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

const MAX_CART_ITEMS = 7;
const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const localData = localStorage.getItem('cartItems');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      return [];
    }
  });
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items));
    window.dispatchEvent(new Event('cartUpdated'));
  }, [items]);

  const addItem = (product: ProductToAdd, options: AddOptions) => {
    setItems((prevItems) => {
      const currentCount = prevItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      // 🔒 Impede ultrapassar o limite de 7 itens
      if (currentCount + options.quantity > MAX_CART_ITEMS) {
        toast.error(
          `O carrinho só pode ter no máximo ${MAX_CART_ITEMS} itens.`,
        );
        return prevItems;
      }

      const existingItem = prevItems.find(
        (item) =>
          item.productId === product.productId &&
          item.size === options.size &&
          JSON.stringify(item.customization) ===
            JSON.stringify(options.customization),
      );

      const customizationFee =
        options.customization &&
        (options.customization.name || options.customization.number)
          ? 20
          : 0;
      const sizeFee = options.size === 'XGG' ? 15 : 0;
      const finalPrice = product.basePrice + customizationFee + sizeFee;

      if (existingItem) {
        toast.success('Quantidade atualizada no carrinho!');
        return prevItems.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + options.quantity }
            : item,
        );
      } else {
        const newItem: CartItem = {
          ...product,
          id: crypto.randomUUID(),
          size: options.size,
          quantity: options.quantity,
          customization: options.customization,
          customizationFee,
          sizeFee,
          price: finalPrice,
          basePrice: product.basePrice,
        };
        toast.success(`${product.title} adicionado ao carrinho!`);
        return [...prevItems, newItem];
      }
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    toast.error('Produto removido do carrinho.');
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      setItems((prevItems) => {
        const totalExcludingCurrent = prevItems.reduce(
          (sum, item) => (item.id === itemId ? sum : sum + item.quantity),
          0,
        );

        // 🔒 Impede que a atualização ultrapasse o limite
        if (totalExcludingCurrent + newQuantity > MAX_CART_ITEMS) {
          toast.error(
            `O carrinho só pode ter no máximo ${MAX_CART_ITEMS} itens.`,
          );
          return prevItems;
        }

        return prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item,
        );
      });
    }
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    toast.info('O seu carrinho foi esvaziado.');
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/coupons/${code}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Cupom inválido');

      setCoupon(data.coupon);
      toast.success(`Cupom "${data.coupon.code}" aplicado com sucesso!`);
      return true;
    } catch (error: any) {
      toast.error(error.message);
      setCoupon(null);
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    toast.info('Cupom removido.');
  };

  const {
    cartCount,
    subtotal,
    shippingPrice,
    discountAmount,
    totalPrice,
    totalCustomizationFee,
  } = useMemo(() => {
    const calculatedCartCount = items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const calculatedSubtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const shippingInfo = calculateShipping(calculatedCartCount);
    const calculatedShippingPrice = shippingInfo.price;

    let calculatedDiscount = 0;
    if (coupon) {
      if (coupon.type === 'percentage') {
        calculatedDiscount = (calculatedSubtotal * coupon.value) / 100;
      } else {
        calculatedDiscount = coupon.value;
      }
    }
    calculatedDiscount = Math.min(calculatedDiscount, calculatedSubtotal);

    const calculatedTotalCustomizationFee = items.reduce(
      (sum, item) => sum + (item.customizationFee || 0) * item.quantity,
      0,
    );

    const calculatedTotalPrice =
      calculatedSubtotal + calculatedShippingPrice - calculatedDiscount;

    return {
      cartCount: calculatedCartCount,
      subtotal: calculatedSubtotal,
      shippingPrice: calculatedShippingPrice,
      discountAmount: calculatedDiscount,
      totalPrice: Math.max(0, calculatedTotalPrice),
      totalCustomizationFee: calculatedTotalCustomizationFee,
    };
  }, [items, coupon]);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    cartCount,
    subtotal,
    shippingPrice,
    totalPrice,
    coupon,
    totalCustomizationFee,
    discountAmount,
    applyCoupon,
    removeCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined)
    throw new Error('useCart must be used within a CartProvider');
  return context;
};

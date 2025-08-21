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

// 1. Tipagem atualizada
export interface CartItem {
  id: string;
  productId: string;
  productSlug?: string;
  title: string;
  price: number;
  basePrice: number;
  customizationFee: number;
  image: string;
  size: string;
  quantity: number;
  customization?: {
    name?: string;
    number?: string;
  } | null;
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
  customization?: {
    name?: string;
    number?: string;
  } | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: ProductToAdd, options: AddOptions) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  cartCount: number; // <-- Alterado de totalQuantity para cartCount
  subtotal: number;
  baseSubtotal: number;
  totalCustomizationFee: number;
  shippingPrice: number;
  totalPrice: number;
}

// 2. Criação do Contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

// 3. Criação do Provedor
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const localData = localStorage.getItem('cartItems');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error('Falha ao carregar o carrinho do localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items));
    // Dispara um evento customizado para que outros componentes (como o Header antigo) possam ouvir
    window.dispatchEvent(new Event('cartUpdated'));
  }, [items]);

  const addItem = (product: ProductToAdd, options: AddOptions) => {
    setItems((prevItems) => {
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
          customizationFee: customizationFee,
          price: product.basePrice + customizationFee,
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
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    }
  };

  const clearCart = () => {
    setItems([]);
    toast.info('Seu carrinho foi esvaziado.');
  };

  // 4. Cálculos Centralizados com useMemo
  const {
    cartCount, // <-- Alterado de totalQuantity para cartCount
    subtotal,
    baseSubtotal,
    totalCustomizationFee,
    shippingPrice,
    totalPrice,
  } = useMemo(() => {
    const calculatedCartCount = items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const calculatedSubtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const calculatedBaseSubtotal = items.reduce(
      (sum, item) => sum + item.basePrice * item.quantity,
      0,
    );
    const calculatedTotalCustomizationFee = items.reduce(
      (sum, item) => sum + item.customizationFee * item.quantity,
      0,
    );

    const shippingInfo = calculateShipping(calculatedCartCount);
    const calculatedShippingPrice = shippingInfo.price;
    const calculatedTotalPrice = calculatedSubtotal + calculatedShippingPrice;

    return {
      cartCount: calculatedCartCount,
      subtotal: calculatedSubtotal,
      baseSubtotal: calculatedBaseSubtotal,
      totalCustomizationFee: calculatedTotalCustomizationFee,
      shippingPrice: calculatedShippingPrice,
      totalPrice: calculatedTotalPrice,
    };
  }, [items]);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    cartCount, // <-- Exposto diretamente
    subtotal,
    baseSubtotal,
    totalCustomizationFee,
    shippingPrice,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// 5. Hook customizado
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

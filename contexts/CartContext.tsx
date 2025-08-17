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
import { calculateShipping } from '@/lib/shipping'; // Assumindo que você tem essa função

// 1. Tipagem (Usando sua interface e adicionando tipos para o contexto)
export interface CartItem {
  id: string; // ID único para a instância do item no carrinho
  productId: string;
  productSlug?: string;
  title: string;
  price: number; // Preço final (base + personalização)
  basePrice: number; // Preço base do produto
  customizationFee: number; // Custo da personalização
  image: string;
  size: string;
  quantity: number;
  customization?: {
    name?: string;
    number?: string;
  } | null;
  team?: string;
  brand?: string;
  category?: string; // Adicionei para corresponder ao seu código
}

interface ProductToAdd {
  // Apenas as propriedades necessárias para criar um CartItem
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
  customizationFee?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: ProductToAdd, options: AddOptions) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number; // Retorna a quantidade total de produtos
  totalQuantity: number; // Valor direto da quantidade total
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
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items));
  }, [items]);

  /**
   * Adiciona um item, verificando se um item idêntico (produto, tamanho, personalização) já existe.
   */
  const addItem = (product: ProductToAdd, options: AddOptions) => {
    setItems((prevItems) => {
      // Verifica se um item com as mesmas características já existe
      const existingItem = prevItems.find(
        (item) =>
          item.productId === product.productId &&
          item.size === options.size &&
          JSON.stringify(item.customization) ===
            JSON.stringify(options.customization),
      );

      // Custo fixo de personalização
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
          price: product.basePrice + customizationFee, // Preço final
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

  // 4. Cálculos Centralizados com useMemo para performance
  const {
    totalQuantity,
    subtotal,
    baseSubtotal,
    totalCustomizationFee,
    shippingPrice,
    totalPrice,
  } = useMemo(() => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const baseSubtotal = items.reduce(
      (sum, item) => sum + item.basePrice * item.quantity,
      0,
    );
    const totalCustomizationFee = items.reduce(
      (sum, item) => sum + item.customizationFee * item.quantity,
      0,
    );

    const shippingInfo = calculateShipping(totalQuantity); // Reutiliza sua lógica de frete
    const shippingPrice = shippingInfo.price;

    const totalPrice = subtotal + shippingPrice;

    return {
      totalQuantity,
      subtotal,
      baseSubtotal,
      totalCustomizationFee,
      shippingPrice,
      totalPrice,
    };
  }, [items]);

  // Função compatível com a sua implementação original
  const getItemCount = () => totalQuantity;

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    totalQuantity,
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

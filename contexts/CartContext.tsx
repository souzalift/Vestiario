'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  productId: string;
  productSlug?: string;
  title: string;
  price: number;
  basePrice?: number;
  customizationFee?: number;
  image: string;
  size: string;
  quantity: number;
  customization?: {
    name?: string;
    number?: string;
  } | null;
  category?: string;
  team?: string;
  brand?: string;
  addedAt?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Carregar itens do localStorage na inicialização
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          console.log('🛒 Carrinho carregado do localStorage:', parsedCart);
          setItems(parsedCart);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar carrinho:', error);
        setItems([]);
      } finally {
        setMounted(true);
      }
    };

    loadCart();
  }, []);

  // Salvar no localStorage sempre que items mudar
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('cart', JSON.stringify(items));
        console.log('💾 Carrinho salvo no localStorage:', items);

        // Disparar evento para atualizar contador no Header
        window.dispatchEvent(new Event('cartUpdated'));
      } catch (error) {
        console.error('❌ Erro ao salvar carrinho:', error);
      }
    }
  }, [items, mounted]);

  const addItem = (newItem: CartItem) => {
    console.log('➕ Adicionando item ao carrinho:', newItem);

    setItems((prevItems) => {
      // Verificar se já existe um item idêntico
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.size === newItem.size &&
          JSON.stringify(item.customization) ===
            JSON.stringify(newItem.customization),
      );

      if (existingItemIndex >= 0) {
        // Se existe, atualizar quantidade
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
        };

        console.log(
          '📝 Item atualizado (quantidade):',
          updatedItems[existingItemIndex],
        );
        toast.success('Quantidade atualizada no carrinho!');
        return updatedItems;
      } else {
        // Se não existe, adicionar novo
        const updatedItems = [
          ...prevItems,
          { ...newItem, addedAt: new Date().toISOString() },
        ];
        console.log('✅ Novo item adicionado:', newItem);
        toast.success('Produto adicionado ao carrinho!');
        return updatedItems;
      }
    });
  };

  const removeItem = (itemId: string) => {
    console.log('🗑️ Removendo item do carrinho:', itemId);
    setItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.id !== itemId);
      toast.success('Produto removido do carrinho!');
      return updatedItems;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    console.log('📝 Atualizando quantidade:', { itemId, quantity });
    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item,
      );
      toast.success('Quantidade atualizada!');
      return updatedItems;
    });
  };

  const clearCart = () => {
    console.log('🧹 Limpando carrinho');
    setItems([]);
    toast.success('Carrinho limpo!');
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}

// Criar arquivo: lib/shipping.ts
export interface ShippingInfo {
  price: number;
  description: string;
  isFree: boolean;
}

export function calculateShipping(totalQuantity: number): ShippingInfo {
  if (totalQuantity >= 4) {
    return {
      price: 0,
      description: 'Frete grátis para 4+ camisas',
      isFree: true
    };
  }

  if (totalQuantity === 3) {
    return {
      price: 15,
      description: 'Frete para 3 camisas',
      isFree: false
    };
  }

  if (totalQuantity === 2) {
    return {
      price: 20,
      description: 'Frete para 2 camisas',
      isFree: false
    };
  }

  if (totalQuantity === 1) {
    return {
      price: 25,
      description: 'Frete para 1 camisa',
      isFree: false
    };
  }

  return {
    price: 0,
    description: 'Carrinho vazio',
    isFree: false
  };
}

export function getNextShippingDiscount(currentQuantity: number): {
  itemsNeeded: number;
  newPrice: number;
  savings: number;
} | null {
  const current = calculateShipping(currentQuantity);

  if (currentQuantity >= 4) return null; // Já tem o melhor frete

  if (currentQuantity === 3) {
    return {
      itemsNeeded: 1,
      newPrice: 0,
      savings: 15
    };
  }

  if (currentQuantity === 2) {
    return {
      itemsNeeded: 2,
      newPrice: 0,
      savings: 20
    };
  }

  if (currentQuantity === 1) {
    return {
      itemsNeeded: 3,
      newPrice: 0,
      savings: 25
    };
  }

  return null;
}
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  stock: number;
  discount: number;
  discountType: 'fixed' | 'percentage';
  variant?: {
    name: string;
    value: string;
  };
  parentId?: string;
  parentName?: string;
  variationCombinationId?: string;
  variations?: Record<string, string>;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity' | 'discount' | 'discountType'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateDiscount: (id: string, discount: number, discountType: 'fixed' | 'percentage') => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getTotalDiscount: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: Omit<CartItem, 'quantity' | 'discount' | 'discountType'>) => {
    setItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1, discount: 0, discountType: 'fixed' }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    // Allow negative quantities for returns/exchanges
    // Only remove if quantity is exactly 0
    if (quantity === 0) {
      removeItem(id);
      return;
    }
    
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const updateDiscount = (id: string, discount: number, discountType: 'fixed' | 'percentage') => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, discount, discountType } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalDiscount = () => {
    return items.reduce((total, item) => {
      if (item.discountType === 'percentage') {
        return total + (item.price * item.quantity * item.discount / 100);
      }
      return total + (item.discount * item.quantity);
    }, 0);
  };

  const getTotal = () => {
    return getSubtotal() - getTotalDiscount();
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updateDiscount,
    clearCart,
    getTotal,
    getSubtotal,
    getTotalDiscount,
    getItemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
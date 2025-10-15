// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cart:v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart:v1', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prev => {
      const idx = prev.findIndex(it => it.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], cantidad: (copy[idx].cantidad || 1) + 1 };
        return copy;
      }
      return [...prev, { ...product, cantidad: 1 }];
    });
  };

  const setQuantity = (id, qty) => {
    setCartItems(prev => prev.map(it => it.id === id ? { ...it, cantidad: qty } : it));
  };

  const increaseQuantity = (id) => setCartItems(prev => prev.map(it => it.id === id ? { ...it, cantidad: (it.cantidad || 1) + 1 } : it));
  const decreaseQuantity = (id) => setCartItems(prev => prev.map(it => it.id === id ? { ...it, cantidad: Math.max(1, (it.cantidad || 1) - 1) } : it));
  const removeFromCart   = (id) => setCartItems(prev => prev.filter(it => it.id !== id));
  const clearCart        = () => setCartItems([]);

  const getTotalPrice = () => cartItems.reduce((acc, it) => acc + (it.precio ?? 0) * (it.cantidad || 1), 0);
  const getTotalItems = () => cartItems.reduce((acc, it) => acc + (it.cantidad || 1), 0);

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    setQuantity,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
  }), [cartItems]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);

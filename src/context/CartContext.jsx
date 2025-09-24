import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const safeParse = (str, fallback) => {
  try { return JSON.parse(str); } catch { return fallback; }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('cart') : null;
    return saved ? safeParse(saved, []) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const exist = prev.find(p => p.id === item.id);
      if (exist) return prev.map(p => p.id === item.id ? { ...p, cantidad: p.cantidad + 1 } : p);
      return [...prev, { ...item, cantidad: 1 }];
    });
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(p => p.id !== id));
  const increaseQuantity = (id) => setCartItems(prev => prev.map(p => p.id === id ? { ...p, cantidad: p.cantidad + 1 } : p));
  const decreaseQuantity = (id) => setCartItems(prev => prev.map(p => p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p).filter(p => p.cantidad > 0));
  const clearCart = () => setCartItems([]);

  const getTotalItems = () => cartItems.reduce((a, i) => a + i.cantidad, 0);
  const getTotalPrice = () => cartItems.reduce((a, i) => a + i.cantidad * (i.precio ?? 0), 0);

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  }), [cartItems]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const STORAGE_KEY = 'cart';

const safeParse = (str, fallback) => {
  try { return JSON.parse(str); } catch { return fallback; }
};

// Normaliza el producto para guardar lo mínimo necesario en el carrito
function normalizeProduct(p) {
  const id = p?.id ?? p?._id ?? p?.slug ?? String(p?.nombre ?? p?.name ?? Math.random());
  return {
    id,
    nombre: p?.nombre ?? p?.name ?? 'Producto',
    precio: Number(p?.precio ?? p?.price ?? 0),
    imagen: p?.imagen ?? p?.images?.[0] ?? p?.image ?? '',
    categoria: p?.categoria ?? p?.category ?? ''
  };
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return saved ? safeParse(saved, []) : [];
  });

  // Persistencia en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  // Mutadores (estables) ----------------------------------------------

  const addToCart = useCallback((product, qty = 1) => {
    const q = Number(qty) > 0 ? Number(qty) : 1;
    const n = normalizeProduct(product);

    setCartItems(prev => {
      const idx = prev.findIndex(it => it.id === n.id);
      if (idx === -1) {
        return [...prev].concat([{ ...n, cantidad: q }]);
      }
      const next = [...prev];
      next[idx] = { ...next[idx], cantidad: next[idx].cantidad + q };
      return next;
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems(prev => prev.filter(it => it.id !== id));
  }, []);

  const increaseQuantity = useCallback((id) => {
    setCartItems(prev => prev.map(it => it.id === id ? { ...it, cantidad: it.cantidad + 1 } : it));
  }, []);

  const decreaseQuantity = useCallback((id) => {
    setCartItems(prev => {
      const next = prev.map(it => it.id === id ? { ...it, cantidad: it.cantidad - 1 } : it);
      return next.filter(it => it.cantidad > 0);
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Selectores (estables) ---------------------------------------------

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0);
  }, [cartItems]);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((acc, it) => acc + (Number(it.precio) * Number(it.cantidad) || 0), 0);
  }, [cartItems]);

  // Valor del contexto (memoizado con dependencias correctas) ---------

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  }), [
    cartItems,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

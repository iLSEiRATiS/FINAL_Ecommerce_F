// src/context/CartContext.jsx
import { createContext, useContext, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const CartCtx = createContext(null);

export function CartProvider({ children }) {
  const { token, loading } = useAuth(); // leemos el estado de sesión
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart_items') || '[]'); } catch { return []; }
  });

  const persist = (items) => {
    setCartItems(items);
    localStorage.setItem('cart_items', JSON.stringify(items));
  };

  const findIndex = (id) => cartItems.findIndex(i => String(i.id || i._id) === String(id));

  // ---- Guard de compra: sólo bloquea si NO hay sesión y no estamos cargando Auth
  const isLoggedIn = !!(token || localStorage.getItem('auth_token'));
  const canBuy = isLoggedIn && !loading;

  const addToCart = (product) => {
    if (!canBuy) {
      window.alert('Iniciá sesión para ver precios y comprar.');
      return;
    }
    const id = product.id || product._id || `${product.categoria}-${product.nombre}`;
    const idx = findIndex(id);
    if (idx >= 0) {
      const copy = [...cartItems];
      copy[idx] = { ...copy[idx], cantidad: (copy[idx].cantidad || 1) + 1 };
      persist(copy);
    } else {
      persist([...cartItems, {
        id,
        nombre: product.nombre,
        precio: product.precio ?? 0,
        imagen: product.imagen || '',
        cantidad: 1
      }]);
    }
  };

  const removeFromCart = (id) => {
    persist(cartItems.filter(it => String(it.id) !== String(id)));
  };

  const clearCart = () => persist([]);

  const updateQuantity = (id, cantidad) => {
    if (!canBuy) {
      window.alert('Iniciá sesión para ver precios y comprar.');
      return;
    }
    const idx = findIndex(id);
    if (idx < 0) return;
    const qty = Math.max(1, Number(cantidad) || 1);
    const copy = [...cartItems];
    copy[idx] = { ...copy[idx], cantidad: qty };
    persist(copy);
  };

  const getTotalItems = () =>
    cartItems.reduce((acc, it) => acc + (it.cantidad || 1), 0);

  const getTotalPrice = () =>
    cartItems.reduce((acc, it) => acc + (it.precio ?? 0) * (it.cantidad || 1), 0);

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
    // útil si querés condicionar UI en algún componente
    canBuy,
  }), [cartItems, canBuy]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}

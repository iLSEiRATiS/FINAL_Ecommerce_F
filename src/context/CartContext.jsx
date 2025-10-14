// src/context/CartContext.jsx
import { createContext, useContext, useMemo, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

// --- Utils ---
const clampCantidad = (q) => {
  const n = Number.isFinite(q) ? q : parseInt(q, 10);
  if (isNaN(n)) return 1;
  return Math.max(1, Math.min(999, n));
};

// --- Actions ---
const TYPES = {
  ADD: 'ADD',
  INC: 'INC',
  DEC: 'DEC',
  SET: 'SET',
  REMOVE: 'REMOVE',
  CLEAR: 'CLEAR',
  HYDRATE: 'HYDRATE',
};

// Estado: { cartItems: Array<{ id, nombre, precio, imagen, cantidad }> }
function reducer(state, action) {
  switch (action.type) {
    case TYPES.HYDRATE: {
      const items = Array.isArray(action.payload) ? action.payload : [];
      // Sanitizar cantidades por las dudas
      const safe = items.map(it => ({ ...it, cantidad: clampCantidad(it.cantidad || 1) }));
      return { ...state, cartItems: safe };
    }
    case TYPES.ADD: {
      const { item, qty = 1 } = action.payload;
      const cantidad = clampCantidad(qty);
      const idx = state.cartItems.findIndex(i => i.id === item.id);
      let cartItems;
      if (idx >= 0) {
        cartItems = state.cartItems.map((it, i) =>
          i === idx ? { ...it, cantidad: clampCantidad((it.cantidad || 0) + cantidad) } : it
        );
      } else {
        cartItems = [...state.cartItems, { ...item, cantidad }];
      }
      return { ...state, cartItems };
    }
    case TYPES.INC: {
      const { id } = action.payload;
      const cartItems = state.cartItems.map(it =>
        it.id === id ? { ...it, cantidad: clampCantidad((it.cantidad || 0) + 1) } : it
      );
      return { ...state, cartItems };
    }
    case TYPES.DEC: {
      const { id } = action.payload;
      const cartItems = state.cartItems.map(it =>
        it.id === id ? { ...it, cantidad: clampCantidad((it.cantidad || 0) - 1) } : it
      );
      return { ...state, cartItems };
    }
    case TYPES.SET: {
      const { id, qty } = action.payload;
      const cartItems = state.cartItems.map(it =>
        it.id === id ? { ...it, cantidad: clampCantidad(qty) } : it
      );
      return { ...state, cartItems };
    }
    case TYPES.REMOVE: {
      const { id } = action.payload;
      return { ...state, cartItems: state.cartItems.filter(it => it.id !== id) };
    }
    case TYPES.CLEAR:
      return { ...state, cartItems: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { cartItems: [] });

  // --- Hydrate desde localStorage al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart:v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({ type: TYPES.HYDRATE, payload: parsed });
      }
    } catch (e) {
      // si falla el parse, ignorar
    }
  }, []);

  // --- Persistir en localStorage cada vez que cambie
  useEffect(() => {
    try {
      localStorage.setItem('cart:v1', JSON.stringify(state.cartItems));
    } catch (e) {
      // almacenamiento puede fallar en modo privado; ignoramos silenciosamente
    }
  }, [state.cartItems]);

  // API pública (mantiene nombres existentes)
  const addToCart = (item, qty = 1) => dispatch({ type: TYPES.ADD, payload: { item, qty } });
  const increaseQuantity = (id) => dispatch({ type: TYPES.INC, payload: { id } });
  const decreaseQuantity = (id) => dispatch({ type: TYPES.DEC, payload: { id } });
  const setQuantity = (id, qty) => dispatch({ type: TYPES.SET, payload: { id, qty } });
  const removeFromCart = (id) => dispatch({ type: TYPES.REMOVE, payload: { id } });
  const clearCart = () => dispatch({ type: TYPES.CLEAR });

  // Totales (como funciones para compat con Header)
  const getTotalPrice = useMemo(
    () => () => state.cartItems.reduce(
      (acc, it) => acc + (Number(it.precio) || 0) * (it.cantidad || 0),
      0
    ),
    [state.cartItems]
  );

  const getTotalItems = useMemo(
    () => () => state.cartItems.reduce((acc, it) => acc + (it.cantidad || 0), 0),
    [state.cartItems]
  );

  const value = {
    cartItems: state.cartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    setQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

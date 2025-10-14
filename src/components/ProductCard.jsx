// src/components/ProductCard.jsx
<<<<<<< HEAD
import { Card, Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

const clamp = (q) => {
  const n = parseInt(q, 10);
  if (isNaN(n)) return 1;
  return Math.max(1, Math.min(999, n));
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState('1');

  const add = () => {
    const n = clamp(qty);
    setQty(String(n));
    addToCart(product, n);
  };

  const onKeyDown = (e) => {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Enter'];
    if (allowed.includes(e.key)) {
      if (e.key === 'Enter') {
        e.preventDefault();
        add();
      }
      return;
    }
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  return (
    <Card className="h-100 product-card d-flex flex-column">
      <div className="product-img-wrap">
        <img
          src={product.imagen}
          alt={product.nombre}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/600x400?text=IMG'; }}
        />
        <span className="badge badge-category">{product.categoria}</span>
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="h6 text-truncate" title={product.nombre}>
          {product.nombre}
        </Card.Title>
        <div className="text-muted small mb-2">
          {product.subcategoria || '—'}
        </div>
        <div className="fw-bold mb-3">{money.format(product.precio ?? 0)}</div>

        <div className="d-flex align-items-center gap-2 mt-auto">
          <Form.Control
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => setQty(String(clamp(qty)))}
            className="text-center"
            style={{ width: 64 }}
            aria-label={`Cantidad para ${product.nombre}`}
          />
          <Button variant="primary" onClick={add}>
            Agregar
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
=======
import { Card, Button } from 'react-bootstrap';

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

const ProductCard = ({ product, onAdd }) => {
  return (
    <Card className="h-100 product-card">
      <div className="product-img-wrap">
        <Card.Img variant="top" src={product.imagen} alt={product.nombre} />
        <span className="badge badge-category">{product.categoria}</span>
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="mb-1 text-truncate" title={product.nombre}>{product.nombre}</Card.Title>
        <div className="text-muted small mb-2">ID: {product.id}</div>
        <div className="fw-bold mb-3">{money.format(product.precio)}</div>
        <Button className="mt-auto w-100" variant="primary" onClick={() => onAdd(product)}>
          Agregar al carrito
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
>>>>>>> origin/main

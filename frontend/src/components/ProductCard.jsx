// src/components/ProductCard.jsx
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

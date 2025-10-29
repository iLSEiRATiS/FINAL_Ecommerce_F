// src/components/ProductCard.jsx
import { Card, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

const ProductCard = ({ product, onAdd }) => {
  const { isLoggedIn } = useAuth();

  return (
    <Card className="h-100 product-card shadow-sm">
      <div className="product-img-wrap position-relative">
        <Card.Img
          variant="top"
          src={product.imagen}
          alt={product.nombre}
          className="object-fit-cover"
        />
        <span className="badge badge-category">{product.categoria}</span>
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="mb-1 text-truncate" title={product.nombre}>
          {product.nombre}
        </Card.Title>
        <div className="text-muted small mb-2">ID: {product.id}</div>

        {/* --- Control de sesión --- */}
        {isLoggedIn ? (
          <>
            <div className="fw-bold mb-3">{money.format(product.precio ?? 0)}</div>
            <Button className="mt-auto w-100" variant="primary" onClick={() => onAdd(product)}>
              Agregar al carrito
            </Button>
          </>
        ) : (
          <div className="mt-auto text-center text-muted small border rounded py-3 px-2">
            <p className="mb-2" style={{ fontStyle: 'italic' }}>
              Iniciá sesión para ver precios y comprar
            </p>
            <Button variant="outline-primary" size="sm" href="/login">
              Iniciar sesión
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProductCard;

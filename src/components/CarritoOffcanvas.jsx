<<<<<<< HEAD
// src/components/CarritoOffcanvas.jsx
=======
>>>>>>> origin/main
import {
  Offcanvas,
  Button,
  Card,
  Image,
  Row,
  Col,
  OverlayTrigger,
<<<<<<< HEAD
  Tooltip,
  Form
} from 'react-bootstrap';
import { useEffect, useState } from 'react';
=======
  Tooltip
} from 'react-bootstrap';
>>>>>>> origin/main
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

<<<<<<< HEAD
const clamp = (q) => {
  const n = parseInt(q, 10);
  if (isNaN(n)) return 1;
  return Math.max(1, Math.min(999, n));
};

=======
/**
 * Panel lateral del carrito (desplegable)
 * Props:
 *  - show: booleano para abrir/cerrar
 *  - handleClose: función para cerrar (setShow(false))
 */
>>>>>>> origin/main
const CarritoOffcanvas = ({ show, handleClose }) => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
<<<<<<< HEAD
    setQuantity,
=======
>>>>>>> origin/main
    removeFromCart,
    getTotalPrice,
    clearCart
  } = useCart();

<<<<<<< HEAD
  const [locals, setLocals] = useState({});

  useEffect(() => {
    const next = {};
    for (const it of cartItems) next[it.id] = String(it.cantidad || 1);
    setLocals(next);
  }, [cartItems, show]);

  useEffect(() => {
    const t = setTimeout(() => {
      for (const it of cartItems) {
        const raw = locals[it.id];
        if (typeof raw === 'undefined') continue;
        const next = clamp(raw);
        if (next !== it.cantidad) setQuantity(it.id, next);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [locals, cartItems, setQuantity]);

  const confirmRemove = (id, name) => {
    if (window.confirm(`¿Eliminar "${name}" del carrito?`)) removeFromCart(id);
  };

  const confirmClear = () => {
    if (cartItems.length === 0) return;
    if (window.confirm('¿Vaciar todo el carrito?')) clearCart();
  };

=======
>>>>>>> origin/main
  return (
    <Offcanvas
      show={show}
      onHide={handleClose}
      placement="end"
      className="cart-offcanvas"
      aria-labelledby="carrito-offcanvas-title"
<<<<<<< HEAD
      backdrop
=======
      backdrop={true}
>>>>>>> origin/main
      scroll={false}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title id="carrito-offcanvas-title" className="fw-bold">
          🛒 Tu carrito
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        {cartItems.length === 0 ? (
          <p className="text-center mt-5 text-muted">Carrito vacío.</p>
        ) : (
          <>
<<<<<<< HEAD
            {cartItems.map((item) => {
              const subtotal = (Number(item.precio) || 0) * (item.cantidad || 0);

              const onBlur = () => {
                const next = clamp(locals[item.id]);
                if (String(next) !== locals[item.id]) {
                  setLocals(prev => ({ ...prev, [item.id]: String(next) }));
                }
                if (next !== item.cantidad) setQuantity(item.id, next);
              };

              const onKeyDown = (e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onBlur();
                }
                const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
                if (allowed.includes(e.key)) return;
                if (!/^\d$/.test(e.key)) e.preventDefault();
              };

              return (
                <Card key={item.id} className="mb-3 shadow-sm border-0">
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col xs={3}>
                        <Image
                          src={item.imagen}
                          alt={item.nombre}
                          fluid
                          roundedCircle
                          style={{ width: 60, height: 60, objectFit: 'cover' }}
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/120x120?text=IMG'; }}
                        />
                      </Col>

                      <Col xs={6} className="d-flex flex-column align-items-center">
                        <OverlayTrigger placement="top" overlay={<Tooltip>{item.nombre}</Tooltip>}>
                          <span
                            className="fw-semibold text-center mb-2 text-truncate w-100"
                            style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                          >
                            {item.nombre}
                          </span>
                        </OverlayTrigger>

                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => decreaseQuantity(item.id)}
                            aria-label={`Disminuir cantidad de ${item.nombre}`}
                            disabled={(item.cantidad || 1) <= 1}
                          >
                            <FaMinus />
                          </Button>

                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={locals[item.id] ?? String(item.cantidad || 1)}
                            onChange={(e) =>
                              setLocals(prev => ({ ...prev, [item.id]: e.target.value }))
                            }
                            onKeyDown={onKeyDown}
                            onBlur={onBlur}
                            className="text-center fw-bold"
                            style={{ width: 64, paddingTop: 2, paddingBottom: 2 }}
                            aria-label={`Cantidad de ${item.nombre}`}
                          />

                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => increaseQuantity(item.id)}
                            aria-label={`Aumentar cantidad de ${item.nombre}`}
                          >
                            <FaPlus />
                          </Button>
                        </div>
                      </Col>

                      <Col xs={3} className="text-end">
                        <small className="text-muted fw-semibold">
                          {money.format(subtotal)}
                        </small>
                        <br />
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="mt-2"
                          onClick={() => confirmRemove(item.id, item.nombre)}
                          aria-label={`Eliminar ${item.nombre}`}
                        >
                          <FaTrash />
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              );
            })}
=======
            {cartItems.map(item => (
              <Card key={item.id} className="mb-3 shadow-sm border-0">
                <Card.Body>
                  <Row className="align-items-center">
                    <Col xs={3}>
                      <Image
                        src={item.imagen}
                        alt={item.nombre}
                        fluid
                        roundedCircle
                        style={{ width: 60, height: 60, objectFit: 'cover' }}
                      />
                    </Col>

                    <Col xs={6} className="d-flex flex-column align-items-center">
                      <OverlayTrigger placement="top" overlay={<Tooltip>{item.nombre}</Tooltip>}>
                        <span
                          className="fw-semibold text-center mb-2 text-truncate w-100"
                          style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                        >
                          {item.nombre}
                        </span>
                      </OverlayTrigger>

                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => decreaseQuantity(item.id)}
                          aria-label={`Disminuir cantidad de ${item.nombre}`}
                        >
                          <FaMinus />
                        </Button>
                        <span className="fw-bold" aria-live="polite">
                          {item.cantidad}
                        </span>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => increaseQuantity(item.id)}
                          aria-label={`Aumentar cantidad de ${item.nombre}`}
                        >
                          <FaPlus />
                        </Button>
                      </div>
                    </Col>

                    <Col xs={3} className="text-end">
                      <small className="text-muted fw-semibold">
                        {money.format((item.precio ?? 0) * item.cantidad)}
                      </small>
                      <br />
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="mt-2"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Eliminar ${item.nombre}`}
                      >
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
>>>>>>> origin/main

            <hr />

            <div className="mb-3 text-end">
              <h5 className="fw-bold">Total: {money.format(getTotalPrice())}</h5>
            </div>

<<<<<<< HEAD
            <Button variant="danger" className="w-100 mb-2" onClick={confirmClear}>
=======
            <Button variant="danger" className="w-100 mb-2" onClick={clearCart}>
>>>>>>> origin/main
              Vaciar carrito
            </Button>
            <Button variant="success" className="w-100" disabled>
              Confirmar pedido
            </Button>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default CarritoOffcanvas;

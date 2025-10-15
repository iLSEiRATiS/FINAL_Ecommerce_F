import { useCart } from '../context/CartContext';
import { Table, Button, Container, Row, Col, Card, Image } from 'react-bootstrap';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

const formatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

const Carrito = () => {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice
  } = useCart();

  return (
    <Container className="my-5">
      <h2 className="mb-4 text-center">🛒 Tu Carrito</h2>

      {cartItems.length === 0 ? (
        <p className="text-center">Tu carrito está vacío.</p>
      ) : (
        <Row>
          <Col md={8}>
            <Table responsive bordered hover className="bg-white" aria-label="Tabla del carrito">
              <thead className="table-light">
                <tr>
                  <th>Producto</th>
                  <th>Imagen</th>
                  <th>Cantidad</th>
                  <th>Acciones</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => {
                  const precio = item.precio ?? 0;
                  const subtotal = item.cantidad * precio;
                  return (
                    <tr key={item.id}>
                      <td className="align-middle">{item.nombre}</td>
                      <td className="align-middle">
                        <Image src={item.imagen} alt={item.nombre} height={50} width={50} style={{ objectFit: 'cover' }} rounded />
                      </td>
                      <td className="align-middle">{item.cantidad}</td>
                      <td className="align-middle">
                        <div className="d-flex gap-2">
                          <Button aria-label={`Aumentar cantidad de ${item.nombre}`} variant="outline-success" size="sm" onClick={() => increaseQuantity(item.id)}>
                            <FaPlus />
                          </Button>
                          <Button aria-label={`Disminuir cantidad de ${item.nombre}`} variant="outline-warning" size="sm" onClick={() => decreaseQuantity(item.id)}>
                            <FaMinus />
                          </Button>
                          <Button aria-label={`Eliminar ${item.nombre} del carrito`} variant="outline-danger" size="sm" onClick={() => removeFromCart(item.id)}>
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                      <td className="align-middle">{formatter.format(subtotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Col>

          <Col md={4}>
            <Card className="p-3 shadow-sm">
              <h4>Resumen de compra</h4>
              <hr />
              <p className="mb-2"><strong>Total:</strong> {formatter.format(getTotalPrice())}</p>
              <Button variant="danger" className="w-100 mb-2" onClick={clearCart}>Vaciar carrito</Button>
              <Button variant="success" className="w-100" disabled>Confirmar pedido</Button>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Carrito;

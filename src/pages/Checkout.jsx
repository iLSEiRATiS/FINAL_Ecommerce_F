import { useState, useMemo } from 'react';
import { Card, Table, Alert, Button, Form, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; // asumimos que existe; si no, reemplazá por tu hook
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Checkout() {
  const { token } = useAuth();
  const { cart, clearCart } = useCart(); // clearCart debería existir por saneidad básica
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [shipping, setShipping] = useState({ name: '', address: '', city: '', zip: '' });

  const items = Array.isArray(cart) ? cart : [];
  const computed = useMemo(() => {
    const list = items.map(it => {
      const qty = Number(it.quantity ?? it.qty ?? 1);
      const price = Number(it.price ?? 0);
      const name = it.name || it.title || 'Producto';
      const productId = String(it._id || it.id || '');
      return { productId, name, price, qty };
    });
    const totals = list.reduce((acc, it) => {
      acc.items += it.qty;
      acc.amount += it.qty * it.price;
      return acc;
    }, { items: 0, amount: 0 });
    totals.amount = +totals.amount.toFixed(2);
    return { list, totals };
  }, [items]);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!token) { navigate('/login?redirect=/checkout', { replace: true }); return; }
    if (!computed.list.length) { setErr('Tu carrito está vacío.'); return; }

    setErr(''); setLoading(true);
    try {
      await api.orders.create(token, {
        items: computed.list,
        shipping,
        payment: { method: 'manual' }
      });
      if (typeof clearCart === 'function') clearCart();
      // Por si tu CartContext es tímido:
      try { localStorage.removeItem('cart'); } catch {}
      navigate('/orders', { replace: true });
    } catch (e) {
      setErr(e?.message || 'No se pudo crear el pedido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container my-4">
      <Card>
        <Card.Header><strong>Checkout</strong></Card.Header>
        <Card.Body>
          {err && <Alert variant="danger" className="mb-3">{err}</Alert>}

          <h6 className="mb-2">Resumen</h6>
          <Table size="sm" bordered responsive>
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-end">Precio</th>
                <th className="text-end">Cantidad</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {computed.list.map((it, i) => (
                <tr key={i}>
                  <td>{it.name}</td>
                  <td className="text-end">${it.price.toFixed(2)}</td>
                  <td className="text-end">{it.qty}</td>
                  <td className="text-end">${(it.qty * it.price).toFixed(2)}</td>
                </tr>
              ))}
              {computed.list.length === 0 && (
                <tr><td colSpan={4} className="text-center py-3">Sin items.</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={2}></th>
                <th className="text-end">{computed.totals.items}</th>
                <th className="text-end">${computed.totals.amount.toFixed(2)}</th>
              </tr>
            </tfoot>
          </Table>

          <hr />

          <Form onSubmit={handlePlaceOrder}>
            <h6 className="mb-2">Envío</h6>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control value={shipping.name} onChange={e => setShipping(s => ({...s, name: e.target.value}))} required />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Dirección</Form.Label>
                <Form.Control value={shipping.address} onChange={e => setShipping(s => ({...s, address: e.target.value}))} required />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Ciudad</Form.Label>
                <Form.Control value={shipping.city} onChange={e => setShipping(s => ({...s, city: e.target.value}))} required />
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label>Código Postal</Form.Label>
                <Form.Control value={shipping.zip} onChange={e => setShipping(s => ({...s, zip: e.target.value}))} required />
              </div>
            </div>

            <Button className="w-100" type="submit" disabled={loading || computed.list.length === 0} aria-busy={loading}>
              {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Procesando…</> : 'Confirmar pedido'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

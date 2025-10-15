import { useEffect, useState } from 'react';
import { Card, Table, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function Orders() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let alive = true;
    async function run() {
      setErr(''); setLoading(true);
      try {
        const data = await api.orders.mine(token);
        if (alive) setRows(Array.isArray(data?.orders) ? data.orders : []);
      } catch (e) {
        if (alive) setErr(e?.message || 'No se pudieron cargar los pedidos');
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (token) run();
    return () => { alive = false; };
  }, [token]);

  if (!user) return null;

  return (
    <div className="container my-4">
      <Card>
        <Card.Header><strong>Mis pedidos</strong></Card.Header>
        <Card.Body>
          {err && <Alert variant="danger" className="mb-3">{err}</Alert>}
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Items</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(o => (
                  <tr key={o._id}>
                    <td>{o._id}</td>
                    <td>{o.totals?.items}</td>
                    <td>${o.totals?.amount?.toFixed ? o.totals.amount.toFixed(2) : o.totals?.amount}</td>
                    <td>{o.status}</td>
                    <td>{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-3">Sin pedidos.</td></tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

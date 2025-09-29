import { useEffect, useState } from 'react';
import { Card, Table, Alert, Spinner, Button, Tabs, Tab } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function Admin() {
  const { token, user } = useAuth();
  const [tab, setTab] = useState('users');

  // usuarios
  const [uLoading, setULoading] = useState(true);
  const [uErr, setUErr] = useState('');
  const [users, setUsers] = useState([]);

  // pedidos
  const [oLoading, setOLoading] = useState(true);
  const [oErr, setOErr] = useState('');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let alive = true;
    async function fetchUsers() {
      setUErr(''); setULoading(true);
      try {
        const data = await api.admin.listUsers(token);
        if (alive) setUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setUErr(e?.message || 'Error al cargar usuarios');
      } finally {
        if (alive) setULoading(false);
      }
    }
    async function fetchOrders() {
      setOErr(''); setOLoading(true);
      try {
        const data = await api.admin.listOrders(token);
        if (alive) setOrders(Array.isArray(data) ? data : (data?.orders || []));
      } catch (e) {
        if (alive) setOErr(e?.message || 'Error al cargar pedidos');
      } finally {
        if (alive) setOLoading(false);
      }
    }
    if (token) {
      fetchUsers();
      fetchOrders();
    }
    return () => { alive = false; };
  }, [token]);

  async function handleDeleteUser(id) {
    if (!id) return;
    if (user && (user.id === id || user._id === id)) {
      alert('No podés borrarte a vos mismo.');
      return;
    }
    if (!confirm('¿Eliminar este usuario y sus pedidos?')) return;
    try {
      await api.admin.deleteUser(token, id);
      setUsers(prev => prev.filter(u => (u._id || u.id) !== id));
      // opcional: también limpiamos pedidos de la vista
      setOrders(prev => prev.filter(o => String(o.user) !== String(id)));
    } catch (e) {
      alert(e?.message || 'No se pudo eliminar.');
    }
  }

  if (user && user.role !== 'admin') {
    return <Alert variant="warning" className="m-3">Acceso restringido.</Alert>;
  }

  return (
    <div className="container my-4">
      <Card>
        <Card.Header><strong>Panel de administración</strong></Card.Header>
        <Card.Body>
          <Tabs activeKey={tab} onSelect={(k) => setTab(k || 'users')} className="mb-3">
            <Tab eventKey="users" title="Usuarios">
              {uErr && <Alert variant="danger" className="mb-3">{uErr}</Alert>}
              {uLoading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Creado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const id = u._id || u.id;
                      return (
                        <tr key={id}>
                          <td>{u.name || '-'}</td>
                          <td>{u.email}</td>
                          <td>{u.role}</td>
                          <td>{new Date(u.createdAt).toLocaleString()}</td>
                          <td className="text-end">
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDeleteUser(id)}
                            >
                              Borrar
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {users.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-3">Sin usuarios.</td></tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Tab>
            <Tab eventKey="orders" title="Pedidos">
              {oErr && <Alert variant="danger" className="mb-3">{oErr}</Alert>}
              {oLoading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>Items</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o._id}>
                        <td>{o._id}</td>
                        <td>{String(o.user)}</td>
                        <td>{o.totals?.items}</td>
                        <td>${o.totals?.amount?.toFixed ? o.totals.amount.toFixed(2) : o.totals?.amount}</td>
                        <td>{o.status}</td>
                        <td>{new Date(o.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-3">Sin pedidos.</td></tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
}

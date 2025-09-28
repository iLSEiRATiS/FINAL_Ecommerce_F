// frontend/src/pages/Admin.jsx
import { useEffect, useState } from 'react';
import { Table, Badge, Alert, Spinner, Card } from 'react-bootstrap';
import { apiFetch } from '../lib/api';

const roleBadge = (role) => {
  const variant = role === 'admin' ? 'danger' : 'secondary';
  return <Badge bg={variant}>{role}</Badge>;
};

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiFetch('/api/admin/users');
        if (alive) setUsers(data);
      } catch (e) {
        if (alive) setErr(e.message || 'No se pudo cargar usuarios');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="admin-page">
      <h2 className="mb-3">Administración</h2>
      <p className="text-muted">Usuarios registrados en la base de datos.</p>

      {err && <Alert variant="danger">{err}</Alert>}

      <Card>
        <Card.Body>
          {loading ? (
            <div className="d-flex align-items-center">
              <Spinner animation="border" role="status" size="sm" className="me-2" />
              Cargando…
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.name || '—'}</td>
                    <td>{u.email}</td>
                    <td>{roleBadge(u.role || 'user')}</td>
                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">Sin usuarios</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Admin;

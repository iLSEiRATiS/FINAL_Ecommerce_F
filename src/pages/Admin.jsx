import { useEffect, useState } from 'react';
import { Card, Table, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function Admin() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let alive = true;
    async function run() {
      setErr('');
      setLoading(true);
      try {
        if (!token) throw new Error('No hay token');
        const data = await api.admin.listUsers(token);
        if (alive) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setErr(e?.message || 'Error al cargar usuarios');
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => { alive = false; };
  }, [token]);

  // Guardia por si alguien entra sin ser admin (el router ya bloquea igual)
  if (user && user.role !== 'admin') {
    return <Alert variant="warning" className="m-3">Acceso restringido.</Alert>;
  }

  return (
    <div className="container my-4">
      <Card>
        <Card.Header><strong>Panel de administración</strong></Card.Header>
        <Card.Body>
          {err && <Alert variant="danger" className="mb-3">{err}</Alert>}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" />
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
                {rows.map(u => (
                  <tr key={u._id || u.id}>
                    <td>{u.name || '-'}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{new Date(u.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-3">Sin usuarios.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

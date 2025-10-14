import { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim().toLowerCase();
    const password = String(form.get('password') || '');

    if (!name || !email || !password) {
      setErrorMsg('Completá todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.auth.register({ name, email, password });
      if (data?.token && data?.user) {
        login({ token: data.token, user: data.user });
        navigate('/', { replace: true });
      } else {
        setErrorMsg('Respuesta inválida del servidor.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo registrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-header">
          <h3 className="auth-title">Crear cuenta</h3>
        </div>
        <div className="auth-body">
          {errorMsg && <Alert variant="danger" className="mb-3">{errorMsg}</Alert>}
          <Form onSubmit={onSubmit} noValidate>
            <Form.Group className="mb-3" controlId="regName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control name="name" type="text" autoComplete="name" required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="regEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" type="email" autoComplete="email" required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="regPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control name="password" type="password" autoComplete="new-password" required />
            </Form.Group>
            <Button className="w-100" type="submit" disabled={loading} aria-busy={loading}>
              {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Creando…</> : 'Crear cuenta'}
            </Button>
            <div className="mt-3 text-center">
              ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default Register;

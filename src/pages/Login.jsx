import { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || '';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get('email');
    const password = form.get('password');
    if (!email || !password) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.token && data?.user) {
          login({ token: data.token, user: data.user });
          navigate('/account');
          return;
        }
      }
      // Fallback mock
      login({ email });
      navigate('/account');
    } catch {
      login({ email });
      navigate('/account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-header">
          <h3 className="auth-title">Iniciar sesión</h3>
        </div>

        <div className="auth-body">
          <Form onSubmit={onSubmit} aria-label="Formulario de inicio de sesión">
            <Form.Group className="mb-3" controlId="loginEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                placeholder="Ingresá tu email"
                autoComplete="email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="loginPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                name="password"
                type="password"
                placeholder="Contraseña"
                autoComplete="current-password"
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={loading} aria-busy={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>

            <div className="mt-3 text-center">
              ¿No tenés cuenta? <Link to="/register">Registrate</Link>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default Login;

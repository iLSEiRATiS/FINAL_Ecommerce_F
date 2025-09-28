import { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// Base del API:
// - Usa REACT_APP_API_URL si existe
// - En producción, si está vacío, cae a tu backend en Render
// - En desarrollo, si está vacío, cae a localhost:4000
const RAW =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://final-ecommerce-b.onrender.com'
    : 'http://localhost:4000');

const API_BASE = RAW.trim().replace(/\/+$/, '');
const IS_DEV = process.env.NODE_ENV === 'development';

const Login = () => {
  const { login } = useAuth(); // espera login({ token, user }) en éxito real; login({ email }) solo en dev
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '').trim().toLowerCase();
    const password = String(form.get('password') || '');

    if (!email || !password) {
      setErrorMsg('Completá email y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const ct = res.headers.get('content-type') || '';
      const payload = ct.includes('application/json')
        ? await res.json().catch(() => ({}))
        : await res.text().catch(() => '');

      if (res.ok && payload?.token && payload?.user) {
        login({ token: payload.token, user: payload.user });
        navigate('/account');
        return;
      }

      const serverMsg =
        (payload && (payload.error || payload.message)) ||
        `${res.status} ${res.statusText}` ||
        'Credenciales inválidas.';
      setErrorMsg(serverMsg);
    } catch {
      if (IS_DEV) {
        // fallback solo en dev para seguir maquetando sin backend
        login({ email });
        navigate('/account');
        return;
      }
      setErrorMsg('No se pudo conectar con el servidor.');
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
          {errorMsg ? (
            <Alert variant="danger" className="mb-3" role="alert" aria-live="assertive">
              {errorMsg}
            </Alert>
          ) : null}

          <Form onSubmit={onSubmit} aria-label="Formulario de inicio de sesión" noValidate>
            <Form.Group className="mb-3" controlId="loginEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                placeholder="Ingresá tu email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
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

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Entrando…
                </>
              ) : (
                'Entrar'
              )}
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

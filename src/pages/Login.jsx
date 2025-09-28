import { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

// Base del API robusta:
// - Usa REACT_APP_API_URL si existe
// - En prod, si no existe, cae al backend de Render
// - En dev, si no existe, usa localhost
// - Limpia barras finales y un "/api" colado
const RAW_ENV = (process.env.REACT_APP_API_URL || '').trim();
const RAW_BASE =
  RAW_ENV ||
  (process.env.NODE_ENV === 'production'
    ? 'https://final-ecommerce-b.onrender.com'
    : 'http://localhost:4000');

function normalizeBase(url) {
  let base = String(url || '').trim();
  base = base.replace(/\/+$/, '');   // sin barra final
  base = base.replace(/\/api$/i, ''); // si alguien puso /api en el env, lo sacamos
  return base;
}
const API_BASE = normalizeBase(RAW_BASE);
const IS_DEV = process.env.NODE_ENV === 'development';

async function doLogin(url, { email, password }) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'omit'
  });
  const ct = res.headers.get('content-type') || '';
  const payload = ct.includes('application/json')
    ? await res.json().catch(() => ({}))
    : await res.text().catch(() => '');
  return { ok: res.ok, status: res.status, statusText: res.statusText, payload };
}

const Login = () => {
  const { login } = useAuth(); // espera login({ token, user })
  const navigate = useNavigate();
  const { search } = useLocation();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Decide a dónde mandar después del login:
  // 1) ?redirect=/ruta
  // 2) admin -> /admin
  // 3) usuario común -> /
  const resolveRedirect = (user) => {
    const params = new URLSearchParams(search);
    const qs = params.get('redirect');
    if (qs && qs.startsWith('/')) return qs;
    if (user?.role === 'admin') return '/admin';
    return '/';
  };

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
      // Construimos candidatos de URL por si el env estaba mal
      const primary = `${API_BASE}/api/auth/login`;
      const alt = `${normalizeBase(RAW_BASE)}/api/auth/login`;
      const prodFallback = `https://final-ecommerce-b.onrender.com/api/auth/login`;

      const tried = new Set();
      const candidates = [];
      for (const u of [primary, alt, prodFallback]) {
        if (!tried.has(u)) { candidates.push(u); tried.add(u); }
      }

      let lastErr = 'No se pudo iniciar sesión.';
      for (const url of candidates) {
        try {
          const { ok, status, statusText, payload } = await doLogin(url, { email, password });
          if (ok && payload?.token && payload?.user) {
            login({ token: payload.token, user: payload.user });
            navigate(resolveRedirect(payload.user), { replace: true });
            return;
          }
          const msg =
            (payload && (payload.error || payload.message)) ||
            `${status} ${statusText}` ||
            'Credenciales inválidas.';
          lastErr = msg;

          // Si no fue 404, no seguimos probando para no ocultar errores reales (401/400)
          if (status && status !== 404) break;
        } catch (err) {
          lastErr = err?.message || 'Fallo de red.';
          // si falla red, probamos el próximo candidato
          continue;
        }
      }

      setErrorMsg(lastErr);
    } catch {
      if (IS_DEV) {
        // solo dev: "modo maqueta"
        login({ email });
        navigate('/', { replace: true });
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

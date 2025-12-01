import { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../lib/api';
import { GOOGLE_AUTH_ENABLED } from '../lib/google';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      setErrorMsg('Completa email y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.auth.login({ email, password });
      if (data?.token && data?.user) {
        login({ token: data.token, user: data.user });
        navigate(resolveRedirect(data.user), { replace: true });
      } else {
        setErrorMsg('Respuesta inválida del servidor.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setErrorMsg('Google no devolvió credenciales.');
      return;
    }
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      const data = await api.auth.google(credentialResponse.credential);
      if (data?.token && data?.user) {
        login({ token: data.token, user: data.user });
        navigate(resolveRedirect(data.user), { replace: true });
      } else {
        setErrorMsg('Respuesta inválida del servidor.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo iniciar sesión con Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMsg('No se pudo conectar con Google.');
  };

  const renderGoogleButton = () => {
    if (GOOGLE_AUTH_ENABLED) {
      return (
        <>
          <GoogleLogin
            width="100%"
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
          />
          {googleLoading && <div className="small text-muted mt-2">Conectando con Google...</div>}
        </>
      );
    }
    return (
      <>
        <Button variant="outline-secondary" className="w-100" disabled>
          Google OAuth no configurado
        </Button>
        <div className="small text-muted mt-2">
          Define REACT_APP_GOOGLE_CLIENT_ID para habilitar este botón.
        </div>
      </>
    );
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-header">
          <h3 className="auth-title">Iniciar sesión</h3>
        </div>
        <div className="auth-body">
          {errorMsg && <Alert variant="danger" className="mb-3">{errorMsg}</Alert>}
          <Form onSubmit={onSubmit} noValidate>
            <Form.Group className="mb-3" controlId="loginEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" type="email" autoComplete="email" required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="loginPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control name="password" type="password" autoComplete="current-password" required />
            </Form.Group>
            <Button className="w-100" type="submit" disabled={loading} aria-busy={loading}>
              {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Entrando…</> : 'Entrar'}
            </Button>
            <div className="mt-3 text-center">
              ¿No tenés cuenta? <Link to="/register">Registrate</Link>
            </div>
          </Form>
          <div className="text-center text-muted my-3">o</div>
          <div className="text-center">
            {renderGoogleButton()}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;

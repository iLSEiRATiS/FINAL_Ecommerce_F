// src/pages/Register.jsx
import { useState } from 'react';
import { Form, Button, Card, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { GOOGLE_AUTH_ENABLED } from '../lib/google';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const form = new FormData(e.currentTarget);
    const firstName = String(form.get('firstName') || '').trim();
    const lastName = String(form.get('lastName') || '').trim();
    const name = String(form.get('name') || `${firstName} ${lastName}`).trim();
    const email = String(form.get('email') || '').trim().toLowerCase();
    const password = String(form.get('password') || '');
    const phone = String(form.get('phone') || '').trim();
    const address = String(form.get('address') || '').trim();
    const city = String(form.get('city') || '').trim();
    const zip = String(form.get('zip') || '').trim();

    if (!name || !email || !password) {
      setErrorMsg('Completá todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.auth.register({ name, email, password, firstName, lastName, phone, address, city, zip });
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
        navigate('/', { replace: true });
      } else {
        setErrorMsg('Respuesta inválida del servidor.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo continuar con Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => setErrorMsg('No se pudo conectar con Google.');

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
          <h3 className="auth-title">Crear cuenta</h3>
        </div>
        <div className="auth-body">
          {errorMsg && <Alert variant="danger" className="mb-3">{errorMsg}</Alert>}
          <Form onSubmit={onSubmit} noValidate>
            <div className="mb-4">
              <h6 className="text-muted text-uppercase small mb-2">Datos personales</h6>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group controlId="regFirstName">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control name="firstName" type="text" autoComplete="given-name" required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group controlId="regLastName">
                    <Form.Label>Apellido</Form.Label>
                    <Form.Control name="lastName" type="text" autoComplete="family-name" required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group controlId="regEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control name="email" type="email" autoComplete="email" required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group controlId="regPassword">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control name="password" type="password" autoComplete="new-password" required />
                  </Form.Group>
                </Col>
              </Row>
            </div>
            <div className="mb-4">
              <h6 className="text-muted text-uppercase small mb-2">Datos de contacto</h6>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group controlId="regPhone">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control name="phone" type="tel" autoComplete="tel" />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group controlId="regAddress">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control name="address" type="text" autoComplete="street-address" />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group controlId="regCity">
                    <Form.Label>Localidad</Form.Label>
                    <Form.Control name="city" type="text" autoComplete="address-level2" />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group controlId="regZip">
                    <Form.Label>CP</Form.Label>
                    <Form.Control name="zip" type="text" autoComplete="postal-code" />
                  </Form.Group>
                </Col>
              </Row>
            </div>
            <Button className="w-100" type="submit" disabled={loading} aria-busy={loading}>
              {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Creando…</> : 'Crear cuenta'}
            </Button>
            <div className="mt-3 text-center">
              ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
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

export default Register;

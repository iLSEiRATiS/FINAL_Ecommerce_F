import { Form, Button, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get('email');
    const password = form.get('password');
    if (!email || !password) return;
    login({ email });
    navigate('/account');
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

            <Button variant="primary" type="submit" className="w-100">
              Entrar
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

import { Form, Button, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get('name');
    const email = form.get('email');
    const password = form.get('password'); // mock
    if (!email || !password) return;
    register({ name, email });
    navigate('/account');
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-header">
          <h3 className="auth-title">Registrarse</h3>
        </div>

        <div className="auth-body">
          <Form onSubmit={onSubmit} aria-label="Formulario de registro">
            <Form.Group className="mb-3" controlId="registerName">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control
                name="name"
                type="text"
                placeholder="Ej: Juan Pérez"
                autoComplete="name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="registerEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                placeholder="Ingresá tu email"
                autoComplete="email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="registerPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                name="password"
                type="password"
                placeholder="Contraseña"
                autoComplete="new-password"
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Registrarme
            </Button>

            <div className="mt-3 text-center">
              ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default Register;

// frontend/src/routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, admin = false }) => {
  const { user } = useAuth();

  // No logueado
  if (!user) return <Navigate to="/login" replace />;

  // Requiere admin y no lo es
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;

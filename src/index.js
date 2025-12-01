import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { GOOGLE_CLIENT_ID, GOOGLE_AUTH_ENABLED } from './lib/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

if (!GOOGLE_AUTH_ENABLED) {
  console.warn('[Google OAuth] REACT_APP_GOOGLE_CLIENT_ID no está configurado. El botón se mostrará deshabilitado.');
}

const AppTree = (
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);

const RootTree = GOOGLE_AUTH_ENABLED
  ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {AppTree}
      </GoogleOAuthProvider>
    )
  : AppTree;

root.render(RootTree);

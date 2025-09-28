// src/lib/api.js
// Base saneada sin barras dobles
const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:4000')
  .trim()
  .replace(/\/+$/, '');

/**
 * apiFetch: wrapper fino con JSON y manejo de errores
 * Exportado para que puedas usarlo directo (Admin.jsx) o vía api.*
 */
export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'omit'
  });

  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json')
    ? await res.json().catch(() => ({}))
    : await res.text().catch(() => '');

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `${res.status} ${res.statusText}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// API de conveniencia
export const api = {
  health: () => apiFetch('/api/health'),
  register: (name, email, password) =>
    apiFetch('/api/auth/register', {
      method: 'POST',
      body: { name, email: String(email).trim().toLowerCase(), password }
    }),
  login: (email, password) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: { email: String(email).trim().toLowerCase(), password }
    }),
  adminUsers: (token) => apiFetch('/api/admin/users', { token })
};

export default api;

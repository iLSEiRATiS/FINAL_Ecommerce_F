// Cliente API único + shim apiFetch

const RAW_ENV = (process.env.REACT_APP_API_URL || '').trim();
const RAW_BASE =
  RAW_ENV ||
  (process.env.NODE_ENV === 'production'
    ? 'https://final-ecommerce-b.onrender.com'
    : 'http://localhost:4000');

function normalizeBase(url) {
  let base = String(url || '').trim();
  base = base.replace(/\/+$/, '');
  base = base.replace(/\/api$/i, '');
  return base;
}

export const API_BASE = normalizeBase(RAW_BASE);

async function http(path, { method = 'GET', body, token, headers: extra = {} } = {}) {
  const headers = { Accept: 'application/json', ...extra };
  if (body != null && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
    credentials: 'omit'
  });

  const ct = res.headers.get('content-type') || '';
  const payload = ct.includes('application/json')
    ? await res.json().catch(() => ({}))
    : await res.text().catch(() => '');

  if (!res.ok) {
    const msg = (payload && (payload.error || payload.message)) || `${res.status} ${res.statusText}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return payload;
}

export const api = {
  auth: {
    register: (data) => http('/api/auth/register', { method: 'POST', body: data }),
    login:    (data) => http('/api/auth/login',    { method: 'POST', body: data }),
    me:       (token) => http('/api/auth/me', { token })
  },
  orders: {
    create: (token, data) => http('/api/orders', { method: 'POST', token, body: data }),
    mine:   (token)       => http('/api/orders/mine', { token }),
    get:    (token, id)   => http(`/api/orders/${encodeURIComponent(id)}`, { token })
  },
  admin: {
    listUsers:  (token)            => http('/api/admin/users', { token }),
    deleteUser: (token, userId)    => http(`/api/admin/users/${encodeURIComponent(userId)}`, { method: 'DELETE', token }),
    listOrders: (token)            => http('/api/admin/orders', { token })
  }
};

// compat legado
export { http as apiFetch };
export default api;

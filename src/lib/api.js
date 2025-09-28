const inferred =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:4000'
    : 'https://final-ecommerce-b.onrender.com';

export const API_BASE = process.env.REACT_APP_API_URL || inferred;

export async function apiFetch(path, { method = 'GET', headers = {}, body, ...rest } = {}) {
  const opts = { method, headers: { 'Content-Type': 'application/json', ...headers }, ...rest };
  if (body !== undefined) opts.body = typeof body === 'string' ? body : JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = isJson && data?.error ? data.error : res.statusText || 'Error de red';
    throw new Error(msg);
  }
  return data;
}

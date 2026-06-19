const API_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'devily.auth.token';

export const authSession = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: token => token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY),
  clear: () => localStorage.removeItem(TOKEN_KEY)
};

export async function api(path, options = {}) {
  const token = authSession.getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) authSession.clear();
    throw new Error(payload.error || 'Não foi possível concluir a solicitação.');
  }
  return payload;
}

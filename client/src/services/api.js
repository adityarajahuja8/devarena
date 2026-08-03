const SERVER_URL = (
  import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

const BASE_URL = `${SERVER_URL}/api/v1`;

/**
 * Builds query string from a plain params object.
 * e.g. { page: 1, q: 'test' }  →  '?page=1&q=test'
 */
function buildQuery(params) {
  if (!params || typeof params !== 'object') return '';
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
  ).toString();
  return qs ? `?${qs}` : '';
}

/**
 * Core fetch wrapper — mirrors the axios instance behaviour:
 *  - Attaches Bearer token from localStorage
 *  - Sends cookies (credentials: 'include')
 *  - Resolves with { data, status, headers } so callers behave identically
 *  - On 401 → clears storage and redirects to /login
 *  - On non-2xx → rejects with an error that has `error.response` attached
 *
 * @param {string}  method   HTTP verb (GET, POST, PUT, PATCH, DELETE)
 * @param {string}  path     e.g. '/auth/login'
 * @param {*}       body     Request body (plain object or FormData)
 * @param {object}  options  Extra options: { params, headers }
 */
async function request(method, path, body = undefined, options = {}) {
  const { params, headers: extraHeaders = {} } = options;

  const url = `${BASE_URL}${path}${buildQuery(params)}`;

  // Build headers
  const headers = { ...extraHeaders };

  const token = localStorage.getItem('hs_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Only set Content-Type to JSON when NOT sending FormData
  // (browser sets the correct multipart boundary automatically for FormData)
  const isFormData = body instanceof FormData;
  if (!isFormData && body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const fetchOptions = {
    method,
    credentials: 'include', // send httpOnly cookies
    headers,
  };

  if (body !== undefined) {
    fetchOptions.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  // Auto-logout on 401
  if (response.status === 401) {
    localStorage.removeItem('hs_token');
    localStorage.removeItem('hs_user');
    window.location.href = '/login';
    return; // stop execution
  }

  // Parse body — handle empty responses (e.g. 204 No Content)
  let data;
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Reject on non-2xx (mirrors axios behaviour)
  if (!response.ok) {
    const error = new Error(
      (typeof data === 'object' && data?.message) ||
        `Request failed with status ${response.status}`
    );
    error.response = { data, status: response.status, headers: response.headers };
    return Promise.reject(error);
  }

  // Return axios-shaped object so every caller keeps working without changes
  return { data, status: response.status, headers: response.headers };
}

// Axios-compatible API surface
const api = {
  get:    (path, options = {})        => request('GET',    path, undefined, options),
  post:   (path, body, options = {})  => request('POST',   path, body,      options),
  put:    (path, body, options = {})  => request('PUT',    path, body,      options),
  patch:  (path, body, options = {})  => request('PATCH',  path, body,      options),
  delete: (path, options = {})        => request('DELETE', path, undefined, options),
};

export default api;

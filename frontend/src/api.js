import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── JWT interceptor ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── 401 response interceptor (auto-logout on expired/invalid token) ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// ── Auth ────────────────────────────────────────────
export async function loginUser(username, password) {
  const res = await api.post('/login', { username, password });
  return res.data;
}

export async function registerUser(username, password, age, gender) {
  const res = await api.post('/register', { username, password, age: Number(age), gender });
  return res.data;
}

// ── Tracking ────────────────────────────────────────
export async function trackEvent(featureName) {
  try {
    await api.post('/track', { feature_name: featureName });
  } catch (err) {
    console.warn('Track event failed:', err.message);
  }
}

// ── Analytics ───────────────────────────────────────
export async function getAnalytics(params = {}) {
  const query = {};
  if (params.startDate) query.start_date = params.startDate;
  if (params.endDate) query.end_date = params.endDate;
  if (params.ageGroup && params.ageGroup !== 'all') query.age_group = params.ageGroup;
  if (params.gender && params.gender !== 'all') query.gender = params.gender;
  if (params.featureName) query.feature_name = params.featureName;

  const res = await api.get('/analytics', { params: query });
  return res.data;
}

export default api;

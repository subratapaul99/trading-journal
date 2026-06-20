import axios from 'axios'
import { useAuthStore } from '@/store/useStore'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
})

// ─── Request interceptor: attach JWT ─────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Response interceptor: handle errors globally ────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong'
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    } else if (err.response?.status >= 500) {
      toast.error('Server error, please try again')
    }
    return Promise.reject(err)
  }
)

// ─── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// ─── Trades ───────────────────────────────────────────────────
export const tradesAPI = {
  getAll: (params) => api.get('/trades', { params }),
  getOne: (id) => api.get(`/trades/${id}`),
  create: (data) => api.post('/trades', data),
  update: (id, data) => api.put(`/trades/${id}`, data),
  delete: (id) => api.delete(`/trades/${id}`),
  uploadScreenshot: (id, file) => {
    const form = new FormData()
    form.append('screenshot', file)
    return api.post(`/trades/${id}/screenshots`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ─── Analytics ────────────────────────────────────────────────
export const analyticsAPI = {
  getSummary: (params) => api.get('/analytics/summary', { params }),
  getEquityCurve: (params) => api.get('/analytics/equity-curve', { params }),
  getMistakes: (params) => api.get('/analytics/mistakes', { params }),
  getCalendar: (params) => api.get('/analytics/calendar', { params }),
  getAIInsights: () => api.post('/ai/analyze'),
}

export default api

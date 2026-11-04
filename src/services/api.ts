import axios from 'axios'

type ErrorBody = {
  message?: unknown
  data?: unknown
  errors?: unknown
}

export class ApiError extends Error {
  readonly status: number | null
  readonly fields: Record<string, string>

  constructor(
    message: string,
    status: number | null,
    fields: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

const fieldErrors = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  )
}

export const normalizeApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error
  if (!axios.isAxiosError(error)) return new ApiError('Não foi possível completar a operação.', null)

  const status = error.response?.status ?? null
  const body = error.response?.data as ErrorBody | undefined
  const message = typeof body?.message === 'string' && body.message.trim()
    ? body.message
    : status === null
      ? 'Não foi possível conectar à API. Verifique sua conexão.'
      : 'Não foi possível completar a operação.'

  return new ApiError(message, status, fieldErrors(body?.data ?? body?.errors))
}

export const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:8081/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// O bearer continua necessário enquanto o M1 não migrar a sessão para cookies.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@Soberana:token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalized = normalizeApiError(error)
    // Só /auth/me prova que a sessão salva deixou de ser válida.
    if (normalized.status === 401 && axios.isAxiosError(error) && error.config?.url === '/auth/me') {
      localStorage.removeItem('@Soberana:token')
      localStorage.removeItem('@Soberana:user')
      delete api.defaults.headers.common.Authorization
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    return Promise.reject(normalized)
  },
)

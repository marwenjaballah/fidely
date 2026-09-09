import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

type RequestConfigWithRetry = InternalAxiosRequestConfig & { _retry?: boolean }

/**
 * API error with status and optional response data.
 * No store imports - used by stores and normalizers.
 */
export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/** Bearer token auth (e.g. tokens in memory/localStorage). */
export interface CreateApiClientConfig {
  baseURL: string
  getToken: () => string | null
  onRefresh: () => Promise<string>
}

/** Cookie-based auth: no token in JS; refresh via POST with credentials. */
export interface CreateCookieAuthApiClientConfig {
  baseURL: string
  useCookies: true
  refreshUrl: string
  onRefresh: () => Promise<void>
}

function normalizeError(err: unknown): ApiError {
  if (err instanceof ApiError) return err
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 0
    const payload = err.response?.data
    let message: string | undefined
    if (payload && typeof payload === 'object') {
      const body = payload as Record<string, unknown>
      if (typeof body?.error === 'object' && body.error !== null && 'message' in body.error) {
        message = (body.error as { message?: string }).message as string | undefined
      }
      if (!message && typeof body?.message === 'string') message = body.message
    }
    return new ApiError(message ?? err.message ?? 'Request failed', status, payload)
  }
  return new ApiError(err instanceof Error ? err.message : 'Request failed', 0, undefined)
}

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false
  return (
    url.includes('/authentication/login') ||
    url.includes('/authentication/register') ||
    url.includes('/authentication/refresh') ||
    url.includes('/authentication/forgot-password') ||
    url.includes('/authentication/reset-password') ||
    url.includes('/authentication/google')
  )
}

/**
 * Creates an axios instance with Bearer token auth:
 * - Request interceptor: adds Authorization Bearer when getToken() returns a value
 * - Response interceptor: on 401 calls onRefresh(), retries with new token
 */
export function createApiClient(config: CreateApiClientConfig): AxiosInstance {
  const { baseURL, getToken, onRefresh } = config
  const client = axios.create({
    baseURL: baseURL.replace(/\/$/, ''),
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  })

  client.interceptors.request.use((req: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      req.headers.Authorization = `Bearer ${token}`
    }
    return req
  })

  let isRefreshing = false
  let refreshSubscribers: ((token: string) => void)[] = []

  function onRefreshed(token: string) {
    refreshSubscribers.forEach((cb) => cb(token))
    refreshSubscribers = []
  }

  client.interceptors.response.use(
    (res) => res,
    async (err) => {
      const originalRequest = err.config
      const reqConfig = originalRequest as RequestConfigWithRetry
      if (
        err.response?.status === 401 &&
        reqConfig &&
        !reqConfig._retry &&
        !isAuthEndpoint(reqConfig.url)
      ) {
        if (!isRefreshing) {
          isRefreshing = true
          reqConfig._retry = true
          try {
            const newToken = await onRefresh()
            isRefreshing = false
            onRefreshed(newToken)
            reqConfig.headers.Authorization = `Bearer ${newToken}`
            return client(reqConfig)
          } catch {
            isRefreshing = false
            throw normalizeError(err)
          }
        }
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((token: string) => {
            reqConfig.headers.Authorization = `Bearer ${token}`
            client(reqConfig).then(resolve).catch(reject)
          })
        })
      }
      throw normalizeError(err)
    },
  )

  return client
}

export const TOKEN_STORAGE_KEYS = {
  accessToken: 'fidely_access_token',
  refreshToken: 'fidely_refresh_token',
}

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEYS.accessToken)
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEYS.refreshToken)
}

export function setStoredTokens(accessToken?: string | null, refreshToken?: string | null) {
  if (typeof window === 'undefined') return
  if (accessToken) localStorage.setItem(TOKEN_STORAGE_KEYS.accessToken, accessToken)
  else localStorage.removeItem(TOKEN_STORAGE_KEYS.accessToken)

  if (refreshToken) localStorage.setItem(TOKEN_STORAGE_KEYS.refreshToken, refreshToken)
  else localStorage.removeItem(TOKEN_STORAGE_KEYS.refreshToken)
}

export function clearStoredTokens() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_STORAGE_KEYS.accessToken)
  localStorage.removeItem(TOKEN_STORAGE_KEYS.refreshToken)
}

/**
 * Creates an axios instance for cookie-based auth (no tokens in JS):
 * - No Authorization header; browser sends HTTP-only cookies
 * - On 401: calls onRefresh() (e.g. POST refresh with credentials), then retries
 */
export function createCookieAuthApiClient(config: CreateCookieAuthApiClientConfig): AxiosInstance {
  const { baseURL, onRefresh } = config
  const client = axios.create({
    baseURL: baseURL.replace(/\/$/, ''),
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  })

  // Automatically attach Bearer token if present (ensures full compatibility with Safari ITP)
  client.interceptors.request.use((req: InternalAxiosRequestConfig) => {
    const token = getStoredAccessToken()
    if (token && !req.headers.Authorization) {
      req.headers.Authorization = `Bearer ${token}`
    }
    return req
  })

  let isRefreshing = false
  let refreshSubscribers: (() => void)[] = []

  function onRefreshed() {
    refreshSubscribers.forEach((cb) => cb())
    refreshSubscribers = []
  }

  client.interceptors.response.use(
    (res) => res,
    async (err) => {
      const originalRequest = err.config
      const reqConfig = originalRequest as RequestConfigWithRetry
      if (
        err.response?.status === 401 &&
        reqConfig &&
        !reqConfig._retry &&
        !isAuthEndpoint(reqConfig.url)
      ) {
        if (!isRefreshing) {
          isRefreshing = true
          reqConfig._retry = true
          try {
            await onRefresh()
            isRefreshing = false
            onRefreshed()
            return client(reqConfig)
          } catch {
            isRefreshing = false
            throw normalizeError(err)
          }
        }
        return new Promise((resolve, reject) => {
          refreshSubscribers.push(() => {
            client(reqConfig).then(resolve).catch(reject)
          })
        })
      }
      throw normalizeError(err)
    },
  )

  return client
}

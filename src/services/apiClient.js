import { API_BASE_URL, API_ENABLED } from '../config/api'

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function getAuthToken() {
  try {
    const raw = sessionStorage.getItem('ss-api-token')
    return raw || null
  } catch {
    return null
  }
}

export function setAuthToken(token) {
  if (token) sessionStorage.setItem('ss-api-token', token)
  else sessionStorage.removeItem('ss-api-token')
}

/**
 * @param {string} endpoint - path from API_ENDPOINTS
 * @param {RequestInit & { body?: object, auth?: boolean }} options
 */
export async function apiRequest(endpoint, options = {}) {
  const { body, auth = true, headers = {}, ...rest } = options

  if (!API_ENABLED) {
    return {
      ok: false,
      offline: true,
      error: 'Backend API is not configured. Set VITE_API_BASE_URL in .env',
    }
  }

  const reqHeaders = {
    Accept: 'application/json',
    ...headers,
  }

  if (body !== undefined && !(body instanceof FormData)) {
    reqHeaders['Content-Type'] = 'application/json'
  }

  if (auth) {
    const token = getAuthToken()
    if (token) reqHeaders.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers: reqHeaders,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : await response.text().catch(() => '')

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed (${response.status})`
    throw new ApiError(message, response.status, data)
  }

  return { ok: true, data, status: response.status }
}

export async function apiGet(endpoint, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'GET' })
}

export async function apiPost(endpoint, body, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'POST', body })
}

export async function apiPut(endpoint, body, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'PUT', body })
}

export async function apiPatch(endpoint, body, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'PATCH', body })
}

export async function apiDelete(endpoint, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'DELETE' })
}

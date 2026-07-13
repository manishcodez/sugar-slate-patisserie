import { API_ENDPOINTS } from '../../config/api'
import { apiGet, apiPost, apiPut, apiPatch, setAuthToken } from '../apiClient'

export async function loginApi(credentials) {
  const res = await apiPost(API_ENDPOINTS.auth.login, credentials, { auth: false })
  if (res.offline) return res
  if (res.data?.token) setAuthToken(res.data.token)
  return { ok: true, data: res.data }
}

export async function registerApi(payload) {
  const res = await apiPost(API_ENDPOINTS.auth.register, payload, { auth: false })
  if (res.offline) return res
  if (res.data?.token) setAuthToken(res.data.token)
  return { ok: true, data: res.data }
}

export async function logoutApi() {
  try {
    await apiPost(API_ENDPOINTS.auth.logout, {})
  } finally {
    setAuthToken(null)
  }
  return { ok: true }
}

export async function forgotPasswordApi(email) {
  const res = await apiPost(API_ENDPOINTS.auth.forgotPassword, { email }, { auth: false })
  if (res.offline) return res
  return { ok: true, data: res.data }
}

export async function resetPasswordApi(payload) {
  const res = await apiPost(API_ENDPOINTS.auth.resetPassword, payload, { auth: false })
  if (res.offline) return res
  return { ok: true, data: res.data }
}

export async function getProfileApi() {
  const res = await apiGet(API_ENDPOINTS.auth.me)
  if (res.offline) return res
  return { ok: true, data: res.data }
}

export async function updateProfileApi(payload) {
  const res = await apiPut(API_ENDPOINTS.auth.profile, payload)
  if (res.offline) return res
  return { ok: true, data: res.data }
}

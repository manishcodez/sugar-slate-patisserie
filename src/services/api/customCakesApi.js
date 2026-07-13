import { API_ENDPOINTS } from '../../config/api'
import { apiGet, apiPost } from '../apiClient'

const CUSTOM_CAKES_KEY = 'ss-custom-cake-requests'

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_CAKES_KEY) || '[]')
  } catch {
    return []
  }
}

function writeLocal(items) {
  localStorage.setItem(CUSTOM_CAKES_KEY, JSON.stringify(items))
}

export async function fetchCakeOptionsApi() {
  const res = await apiGet(API_ENDPOINTS.customCakes.options, { auth: false })
  if (res.offline) return { ok: false, offline: true }
  return { ok: true, data: res.data }
}

export async function estimateCakePriceApi(payload) {
  const res = await apiPost(API_ENDPOINTS.customCakes.estimate, payload, { auth: false })
  if (res.offline) return { ok: false, offline: true }
  return { ok: true, data: res.data }
}

export async function submitCustomCakeApi(payload) {
  const res = await apiPost(API_ENDPOINTS.customCakes.create, payload)
  if (res.offline) {
    const items = readLocal()
    const saved = {
      ...payload,
      id: `CC-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    items.unshift(saved)
    writeLocal(items)
    return { ok: true, data: saved, offline: true }
  }
  return { ok: true, data: res.data }
}

import { API_ENDPOINTS } from '../../config/api'
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '../apiClient'

const ADDR_KEY = 'ss-addresses-by-user'

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(ADDR_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeAll(data) {
  localStorage.setItem(ADDR_KEY, JSON.stringify(data))
}

function readForUser(userId) {
  if (!userId) return []
  return readAll()[userId] || []
}

function writeForUser(userId, items) {
  if (!userId) return
  const all = readAll()
  all[userId] = items
  writeAll(all)
}

export async function fetchAddressesApi(userId) {
  const res = await apiGet(API_ENDPOINTS.addresses.list)
  if (res.offline) return { ok: true, data: readForUser(userId), offline: true }
  return { ok: true, data: res.data?.addresses ?? res.data ?? [] }
}

export async function createAddressApi(address, userId) {
  const res = await apiPost(API_ENDPOINTS.addresses.create, address)
  if (res.offline) {
    if (!userId) return { ok: false, error: 'Login required to save addresses' }
    const items = readForUser(userId)
    const saved = { ...address, id: `addr-${Date.now()}`, isDefault: items.length === 0 }
    items.push(saved)
    writeForUser(userId, items)
    return { ok: true, data: saved, offline: true }
  }
  return { ok: true, data: res.data }
}

export async function updateAddressApi(id, address, userId) {
  const res = await apiPut(API_ENDPOINTS.addresses.update(id), address)
  if (res.offline) {
    if (!userId) return { ok: false, error: 'Login required' }
    const items = readForUser(userId).map((a) => (a.id === id ? { ...a, ...address } : a))
    writeForUser(userId, items)
    return { ok: true, data: items.find((a) => a.id === id), offline: true }
  }
  return { ok: true, data: res.data }
}

export async function deleteAddressApi(id, userId) {
  const res = await apiDelete(API_ENDPOINTS.addresses.delete(id))
  if (res.offline) {
    if (!userId) return { ok: false, error: 'Login required' }
    writeForUser(userId, readForUser(userId).filter((a) => a.id !== id))
    return { ok: true, offline: true }
  }
  return { ok: true, data: res.data }
}

export async function setDefaultAddressApi(id, userId) {
  const res = await apiPatch(API_ENDPOINTS.addresses.default(id), {})
  if (res.offline) {
    if (!userId) return { ok: false, error: 'Login required' }
    const items = readForUser(userId).map((a) => ({ ...a, isDefault: a.id === id }))
    writeForUser(userId, items)
    return { ok: true, offline: true }
  }
  return { ok: true, data: res.data }
}

/** Migrate legacy flat list into first logged-in user (one-time). */
export function migrateLegacyAddresses(userId) {
  if (!userId) return
  try {
    const legacy = localStorage.getItem('ss-addresses')
    if (!legacy) return
    const items = JSON.parse(legacy)
    if (!Array.isArray(items) || items.length === 0) return
    if (readForUser(userId).length > 0) return
    writeForUser(userId, items)
    localStorage.removeItem('ss-addresses')
  } catch {
    /* ignore */
  }
}

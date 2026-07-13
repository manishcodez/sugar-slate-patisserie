import { API_ENDPOINTS } from '../../config/api'
import { apiGet, apiPost, apiDelete } from '../apiClient'

const WISHLIST_KEY = 'ss-wishlist-by-user'

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeAll(data) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(data))
}

function readForUser(userId) {
  if (!userId) return []
  return readAll()[userId] || []
}

function writeForUser(userId, ids) {
  if (!userId) return
  const all = readAll()
  all[userId] = ids
  writeAll(all)
}

export async function fetchWishlistApi(userId) {
  const res = await apiGet(API_ENDPOINTS.wishlist.list)
  if (res.offline) return { ok: true, data: readForUser(userId), offline: true }
  return { ok: true, data: res.data?.items ?? res.data ?? [] }
}

export async function addToWishlistApi(productId, userId) {
  const res = await apiPost(API_ENDPOINTS.wishlist.add, { productId })
  if (res.offline) {
    if (!userId) return { ok: false, error: 'Login required for wishlist' }
    const items = readForUser(userId)
    if (!items.includes(productId)) {
      items.push(productId)
      writeForUser(userId, items)
    }
    return { ok: true, data: items, offline: true }
  }
  return { ok: true, data: res.data }
}

export async function removeFromWishlistApi(productId, userId) {
  const res = await apiDelete(API_ENDPOINTS.wishlist.remove(productId))
  if (res.offline) {
    if (!userId) return { ok: false, error: 'Login required for wishlist' }
    const items = readForUser(userId).filter((id) => id !== productId)
    writeForUser(userId, items)
    return { ok: true, data: items, offline: true }
  }
  return { ok: true, data: res.data }
}

export function syncWishlistLocal(ids, userId) {
  if (!userId) return
  writeForUser(userId, ids)
}

export function readWishlistLocal(userId) {
  return readForUser(userId)
}

/** Migrate legacy flat wishlist into first logged-in user (one-time). */
export function migrateLegacyWishlist(userId) {
  if (!userId) return
  try {
    const legacy = localStorage.getItem('ss-wishlist')
    if (!legacy) return
    const items = JSON.parse(legacy)
    if (!Array.isArray(items) || items.length === 0) return
    if (readForUser(userId).length > 0) return
    writeForUser(userId, items)
    localStorage.removeItem('ss-wishlist')
  } catch {
    /* ignore */
  }
}

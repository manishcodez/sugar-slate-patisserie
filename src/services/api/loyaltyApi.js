import { API_ENDPOINTS } from '../../config/api'
import { apiGet } from '../apiClient'

const STORAGE_KEY = 'ss-loyalty-by-user'
const EMPTY = { points: 0, history: [] }

function readLocalLoyalty(userId) {
  if (!userId) return EMPTY
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return all[userId] || EMPTY
  } catch {
    return EMPTY
  }
}

function writeLocalLoyalty(userId, data) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  all[userId] = data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export async function fetchLoyaltyApi(userId) {
  const res = await apiGet(API_ENDPOINTS.loyalty.balance)
  if (res.offline) return { ok: true, data: readLocalLoyalty(userId), offline: true }
  return { ok: true, data: res.data }
}

export function saveLoyaltyLocally(userId, data) {
  if (userId) writeLocalLoyalty(userId, data)
}

export { readLocalLoyalty, writeLocalLoyalty, EMPTY }

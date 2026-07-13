import { API_ENDPOINTS } from '../../config/api'
import { apiGet, apiPatch, apiPost } from '../apiClient'

const NOTIF_KEY = 'ss-notifications'

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]')
  } catch {
    return []
  }
}

function writeLocal(items) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(items))
}

export async function fetchNotificationsApi() {
  const res = await apiGet(API_ENDPOINTS.notifications.list)
  if (res.offline) return { ok: true, data: readLocal(), offline: true }
  return { ok: true, data: res.data?.notifications ?? res.data ?? [] }
}

export async function markNotificationReadApi(id) {
  const res = await apiPatch(API_ENDPOINTS.notifications.markRead(id), {})
  if (res.offline) {
    const items = readLocal().map((n) => (n.id === id ? { ...n, read: true } : n))
    writeLocal(items)
    return { ok: true, offline: true }
  }
  return { ok: true, data: res.data }
}

export async function markAllNotificationsReadApi() {
  const res = await apiPost(API_ENDPOINTS.notifications.markAllRead, {})
  if (res.offline) {
    const items = readLocal().map((n) => ({ ...n, read: true }))
    writeLocal(items)
    return { ok: true, offline: true }
  }
  return { ok: true, data: res.data }
}

export function addNotificationLocal(notification) {
  const items = readLocal()
  items.unshift({
    id: `notif-${Date.now()}`,
    read: false,
    createdAt: new Date().toISOString(),
    ...notification,
  })
  writeLocal(items)
  return items
}

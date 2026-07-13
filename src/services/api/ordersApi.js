import { API_ENDPOINTS } from '../../config/api'
import { apiGet, apiPost } from '../apiClient'

const ORDERS_KEY = 'ss-orders'

function readLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]')
  } catch {
    return []
  }
}

function writeLocalOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

export async function fetchOrdersApi() {
  const res = await apiGet(API_ENDPOINTS.orders.list)
  if (res.offline) {
    return { ok: true, data: readLocalOrders(), offline: true }
  }
  return { ok: true, data: res.data?.orders ?? res.data ?? [] }
}

export async function createOrderApi(order) {
  const res = await apiPost(API_ENDPOINTS.orders.create, order)
  if (res.offline) {
    const orders = readLocalOrders()
    const saved = {
      ...order,
      id: order.id || `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: order.status || 'confirmed',
    }
    orders.unshift(saved)
    writeLocalOrders(orders)
    return { ok: true, data: saved, offline: true }
  }
  return { ok: true, data: res.data }
}

export async function getOrderApi(id) {
  const res = await apiGet(API_ENDPOINTS.orders.byId(id))
  if (res.offline) {
    const order = readLocalOrders().find((o) => o.id === id)
    return order ? { ok: true, data: order, offline: true } : { ok: false, error: 'Order not found' }
  }
  return { ok: true, data: res.data }
}

export async function trackOrderApi(id, email = '') {
  const query = email ? `?email=${encodeURIComponent(email)}` : ''
  const res = await apiGet(`${API_ENDPOINTS.orders.track(id)}${query}`, { auth: false })
  if (res.offline) {
    const order = readLocalOrders().find((o) => o.id === id)
    if (!order) return { ok: false, error: 'Order not found' }
    return {
      ok: true,
      data: {
        orderId: order.id,
        status: order.status,
        timeline: order.timeline || [],
        estimatedDelivery: order.estimatedDelivery,
      },
      offline: true,
    }
  }
  return { ok: true, data: res.data }
}

export function saveOrderLocally(order) {
  const orders = readLocalOrders()
  orders.unshift(order)
  writeLocalOrders(orders)
}

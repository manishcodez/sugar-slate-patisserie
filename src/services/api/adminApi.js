import { API_ENDPOINTS } from '../../config/api'
import { AUTH_STORAGE_KEY } from '../../data/adminConfig'
import { apiGet, apiPatch, apiDelete } from '../apiClient'

function readLocalCustomers() {
  try {
    const users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '[]')
    return users
      .filter((u) => u.role !== 'admin')
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        role: u.role || 'user',
        createdAt: u.createdAt || new Date().toISOString(),
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch {
    return []
  }
}

function readLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem('ss-orders') || '[]')
  } catch {
    return []
  }
}

function readContactQueue() {
  try {
    return JSON.parse(localStorage.getItem('ss-contact-queue') || '[]')
  } catch {
    return []
  }
}

function readFeedbackQueue() {
  try {
    return JSON.parse(localStorage.getItem('ss-feedback-queue') || '[]')
  } catch {
    return []
  }
}

function readLocalCustomCakes() {
  try {
    return JSON.parse(localStorage.getItem('ss-custom-cake-requests') || '[]')
  } catch {
    return []
  }
}

export async function fetchCustomersApi() {
  const res = await apiGet(API_ENDPOINTS.admin.customers)
  if (res.offline) {
    const customers = readLocalCustomers()
    return { ok: true, data: { customers, total: customers.length }, offline: true }
  }
  return { ok: true, data: res.data }
}

export async function fetchCustomerStatsApi() {
  const res = await apiGet(API_ENDPOINTS.admin.customerStats)
  if (res.offline) {
    const customers = readLocalCustomers()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return {
      ok: true,
      data: {
        total: customers.length,
        today: customers.filter((c) => new Date(c.createdAt) >= today).length,
        thisWeek: customers.filter((c) => new Date(c.createdAt).getTime() >= weekAgo).length,
      },
      offline: true,
    }
  }
  return { ok: true, data: res.data }
}

export async function makeCustomerAdminApi(id) {
  const res = await apiPatch(API_ENDPOINTS.admin.makeAdmin(id), {})
  if (res.offline) return { ok: false, offline: true }
  return { ok: true, data: res.data }
}

export async function fetchAdminOrdersApi() {
  const res = await apiGet(API_ENDPOINTS.admin.orders)
  if (res.offline) {
    return { ok: true, data: { orders: readLocalOrders() }, offline: true }
  }
  return { ok: true, data: res.data }
}

export async function updateOrderStatusApi(id, status) {
  const res = await apiPatch(API_ENDPOINTS.admin.orderStatus(id), { status })
  if (res.offline) return { ok: false, offline: true }
  return { ok: true, data: res.data }
}

export async function fetchAdminMessagesApi() {
  const res = await apiGet(API_ENDPOINTS.admin.messages)
  if (res.offline) {
    const contact = readContactQueue().map((m, i) => ({
      id: `local-contact-${i}`,
      type: 'contact',
      name: m.name,
      email: m.email,
      phone: m.phone || '',
      subject: m.subject || '',
      message: m.message,
      createdAt: m.queuedAt || new Date().toISOString(),
    }))
    const feedback = readFeedbackQueue().map((m, i) => ({
      id: `local-feedback-${i}`,
      type: 'feedback',
      name: m.name,
      email: m.email,
      category: m.category || '',
      rating: m.rating,
      message: m.message,
      createdAt: m.queuedAt || new Date().toISOString(),
    }))
    return { ok: true, data: { contact, feedback }, offline: true }
  }
  return { ok: true, data: res.data }
}

export async function fetchCustomCakesApi() {
  const res = await apiGet(API_ENDPOINTS.admin.customCakes)
  if (res.offline) {
    const requests = readLocalCustomCakes().map((r) => ({
      id: r.id,
      status: r.status || 'pending',
      estimatedMin: r.estimatedMin,
      estimatedMax: r.estimatedMax,
      payload: r,
      createdAt: r.createdAt,
    }))
    return { ok: true, data: { requests }, offline: true }
  }
  return { ok: true, data: res.data }
}

export async function updateCustomCakeStatusApi(id, status) {
  const res = await apiPatch(API_ENDPOINTS.admin.customCakeStatus(id), { status })
  if (res.offline) return { ok: false, offline: true }
  return { ok: true, data: res.data }
}

export async function fetchNewsletterSubscribersApi() {
  const res = await apiGet(API_ENDPOINTS.admin.newsletter)
  if (res.offline) return { ok: true, data: { subscribers: [], total: 0 }, offline: true }
  return { ok: true, data: res.data }
}

export async function fetchAdminReviewsApi() {
  const res = await apiGet(API_ENDPOINTS.admin.reviews)
  if (res.offline) return { ok: true, data: { reviews: [] }, offline: true }
  return { ok: true, data: res.data }
}

export async function approveReviewApi(id, approved = true) {
  const res = await apiPatch(API_ENDPOINTS.admin.reviewApprove(id), { approved })
  if (res.offline) return { ok: false, offline: true }
  return { ok: true, data: res.data }
}

export async function deleteReviewApi(id) {
  const res = await apiDelete(API_ENDPOINTS.admin.reviewDelete(id))
  if (res.offline) return { ok: false, offline: true }
  return { ok: true, data: res.data }
}

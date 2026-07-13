import { API_ENDPOINTS } from '../../config/api'
import { apiGet, apiPost } from '../apiClient'

export async function fetchReviewsApi(productId) {
  const endpoint = productId
    ? `${API_ENDPOINTS.reviews.list}?productId=${encodeURIComponent(productId)}`
    : API_ENDPOINTS.reviews.list
  const res = await apiGet(endpoint, { auth: false })
  if (res.offline) return { ok: false, offline: true }
  return { ok: true, data: res.data?.reviews ?? res.data ?? [] }
}

export async function submitReviewApi(payload) {
  const res = await apiPost(API_ENDPOINTS.reviews.create, payload)
  if (res.offline) return res
  return { ok: true, data: res.data }
}

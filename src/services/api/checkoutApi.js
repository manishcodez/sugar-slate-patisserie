import { API_ENDPOINTS } from '../../config/api'
import { apiPost } from '../apiClient'
import { createOrderApi } from './ordersApi'

export async function submitCheckoutApi(payload) {
  try {
    const res = await apiPost(API_ENDPOINTS.checkout.create, payload)
    if (res.offline) {
      return createOrderApi({
        ...payload,
        type: 'checkout',
        status: 'preparing',
      })
    }
    return { ok: true, data: res.data }
  } catch (err) {
    return { ok: false, error: err.message || 'Checkout failed' }
  }
}

export async function validateCheckoutApi(payload) {
  const res = await apiPost(API_ENDPOINTS.checkout.validate, payload)
  if (res.offline) return { ok: true, data: { valid: true }, offline: true }
  return { ok: true, data: res.data }
}

import { API_ENDPOINTS } from '../../config/api'
import { apiGet, apiPost } from '../apiClient'

export async function fetchPaymentConfigApi() {
  const res = await apiGet(API_ENDPOINTS.payments.config, { auth: false })
  if (res.offline) {
    return { ok: true, data: { razorpayEnabled: false, keyId: '', demoMode: true }, offline: true }
  }
  return { ok: true, data: res.data }
}

export async function createRazorpayOrderApi(amount) {
  try {
    const res = await apiPost(API_ENDPOINTS.payments.razorpayCreate, { amount })
    return { ok: true, data: res.data }
  } catch (err) {
    return { ok: false, error: err.message || 'Could not start payment' }
  }
}

export async function verifyRazorpayPaymentApi(payload) {
  try {
    const res = await apiPost(API_ENDPOINTS.payments.razorpayVerify, payload)
    return { ok: true, data: res.data }
  } catch (err) {
    return { ok: false, error: err.message || 'Payment verification failed' }
  }
}

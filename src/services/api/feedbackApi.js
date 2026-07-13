import { API_ENDPOINTS } from '../../config/api'
import { apiPost } from '../apiClient'

const FEEDBACK_KEY = 'ss-feedback-queue'

export async function submitFeedbackApi(payload) {
  const res = await apiPost(API_ENDPOINTS.feedback.submit, payload, { auth: false })
  if (!res.offline) return { ok: true, data: res.data }

  const items = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]')
  items.push({ ...payload, queuedAt: new Date().toISOString() })
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(items))
  return {
    ok: true,
    offline: true,
    data: { queued: true },
    message: 'Feedback saved. It will sync when the API is available.',
  }
}

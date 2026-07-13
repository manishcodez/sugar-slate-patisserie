import { API_ENDPOINTS } from '../../config/api'
import { apiPost } from '../apiClient'
import { BAKERY, FORMSPREE_ENDPOINT } from '../../data/constants'

const CONTACT_QUEUE_KEY = 'ss-contact-queue'

function queueLocally(payload) {
  const items = JSON.parse(localStorage.getItem(CONTACT_QUEUE_KEY) || '[]')
  items.push({ ...payload, queuedAt: new Date().toISOString() })
  localStorage.setItem(CONTACT_QUEUE_KEY, JSON.stringify(items))
}

export async function submitContactApi(payload) {
  const res = await apiPost(API_ENDPOINTS.contact.submit, payload, { auth: false })
  if (!res.offline) return { ok: true, data: res.data }

  if (FORMSPREE_ENDPOINT) {
    try {
      const formData = new FormData()
      Object.entries(payload).forEach(([k, v]) => formData.append(k, v))
      const fsRes = await fetch(FORMSPREE_ENDPOINT, { method: 'POST', body: formData })
      if (fsRes.ok) return { ok: true, data: { fallback: 'formspree' } }
    } catch {
      /* fall through */
    }
  }

  queueLocally(payload)
  return {
    ok: true,
    offline: true,
    data: { queued: true },
    message: 'Message saved locally. It will sync when the API is available.',
  }
}

export function getContactDefaults() {
  return {
    bakeryName: BAKERY.name,
    bakeryEmail: BAKERY.email,
  }
}

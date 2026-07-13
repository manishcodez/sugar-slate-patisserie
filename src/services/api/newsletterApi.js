import { API_ENDPOINTS } from '../../config/api'
import { apiPost } from '../apiClient'

const NEWSLETTER_KEY = 'ss-newsletter-subscribers'

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(NEWSLETTER_KEY) || '[]')
  } catch {
    return []
  }
}

function writeLocal(items) {
  localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(items))
}

export async function subscribeNewsletterApi(email) {
  const res = await apiPost(API_ENDPOINTS.newsletter.subscribe, { email }, { auth: false })
  if (!res.offline) return { ok: true, data: res.data }

  const items = readLocal()
  if (!items.includes(email.toLowerCase())) {
    items.push(email.toLowerCase())
    writeLocal(items)
  }
  return {
    ok: true,
    offline: true,
    data: { subscribed: true },
    message: 'Subscribed! We will confirm when our server syncs.',
  }
}

export async function unsubscribeNewsletterApi(email) {
  const res = await apiPost(API_ENDPOINTS.newsletter.unsubscribe, { email }, { auth: false })
  if (!res.offline) return { ok: true, data: res.data }

  writeLocal(readLocal().filter((e) => e !== email.toLowerCase()))
  return { ok: true, offline: true, data: { unsubscribed: true } }
}

import { ADMIN_REQUESTS_KEY } from '../data/adminConfig'

const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID
const API_KEY = import.meta.env.VITE_JSONBIN_API_KEY

export const hasCloudStore = Boolean(BIN_ID && API_KEY)

function loadLocal() {
  try {
    const raw = localStorage.getItem(ADMIN_REQUESTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocal(requests) {
  localStorage.setItem(ADMIN_REQUESTS_KEY, JSON.stringify(requests))
}

export async function getAllAdminRequests() {
  if (hasCloudStore) {
    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: { 'X-Master-Key': API_KEY },
      })
      if (res.ok) {
        const data = await res.json()
        const requests = data.record?.requests || []
        saveLocal(requests)
        return requests
      }
    } catch {
      /* fall through */
    }
  }
  return loadLocal()
}

export async function saveAllAdminRequests(requests) {
  saveLocal(requests)
  if (hasCloudStore) {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY,
      },
      body: JSON.stringify({ requests }),
    })
    if (!res.ok) {
      throw new Error('Cloud save failed. Check JSONBin in .env file.')
    }
  }
}

export function generateApprovalCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function addAdminRequest(request) {
  const requests = await getAllAdminRequests()
  requests.push(request)
  await saveAllAdminRequests(requests)
  return request
}

async function setRequestStatus(requests, idx, status) {
  requests[idx].status = status
  requests[idx][`${status}At`] = new Date().toISOString()
  await saveAllAdminRequests(requests)
  return { ok: true, request: requests[idx] }
}

export async function updateRequestById(id, status) {
  const requests = await getAllAdminRequests()
  const idx = requests.findIndex((r) => r.id === id)
  if (idx === -1) return { ok: false, error: 'Request not found' }
  return setRequestStatus(requests, idx, status)
}

export async function approveByCode(code) {
  const trimmed = code.trim()
  if (!/^\d{6}$/.test(trimmed)) {
    return { ok: false, error: 'Enter valid 6-digit code from Gmail' }
  }

  const requests = await getAllAdminRequests()
  const idx = requests.findIndex((r) => r.approvalCode === trimmed && r.status === 'pending')
  if (idx === -1) {
    return { ok: false, error: 'Code not found. Check Gmail or use email approve below.' }
  }
  return setRequestStatus(requests, idx, 'approved')
}

export async function approveByEmail(email, name = '') {
  const trimmed = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: 'Enter a valid email' }
  }

  const requests = await getAllAdminRequests()
  const idx = requests.findIndex((r) => r.email === trimmed)

  if (idx !== -1) {
    if (requests[idx].status === 'approved' || requests[idx].status === 'completed') {
      return { ok: false, error: 'This email is already approved.' }
    }
    return setRequestStatus(requests, idx, 'approved')
  }

  requests.push({
    id: `req-${Date.now()}`,
    approvalCode: generateApprovalCode(),
    name: name.trim() || trimmed.split('@')[0],
    email: trimmed,
    phone: '',
    message: 'Manually approved by owner from Gmail',
    status: 'approved',
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
  })
  await saveAllAdminRequests(requests)
  return { ok: true, request: requests[requests.length - 1] }
}

export async function rejectByEmail(email) {
  const trimmed = email.trim().toLowerCase()
  const requests = await getAllAdminRequests()
  const idx = requests.findIndex((r) => r.email === trimmed && r.status === 'pending')
  if (idx === -1) return { ok: false, error: 'No pending request for this email' }
  return setRequestStatus(requests, idx, 'rejected')
}

export async function isEmailApproved(email) {
  const trimmed = email.trim().toLowerCase()
  const requests = await getAllAdminRequests()
  return requests.some((r) => r.email === trimmed && (r.status === 'approved' || r.status === 'completed'))
}

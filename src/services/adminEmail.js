import { FORMSPREE_ENDPOINT } from '../data/constants'
import { OWNER_EMAIL } from '../data/adminConfig'

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY

function buildEmailBody({ name, email, phone, message, approvalCode }) {
  return [
    'NEW ADMIN ACCESS REQUEST',
    '========================',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`,
    '',
    'Message:',
    message,
    '',
    '========================',
    'HOW TO APPROVE (On Website):',
    '========================',
    '',
    '1. Log in to the Admin Panel at /#admin',
    '2. Go to Customers tab',
    '3. Find the user and click "Make Admin"',
    '',
    `Approval Code: ${approvalCode}`,
  ].join('\n')
}

async function sendViaWeb3Forms(payload) {
  if (!WEB3FORMS_KEY) return null

  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: `[Admin Request] Code: ${payload.approvalCode}`,
      from_name: 'Sugar & Slate',
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      message: payload.body,
      replyto: payload.email,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.success) throw new Error(data.message || 'Web3Forms failed')
  return 'web3forms'
}

async function sendViaFormSubmit(payload) {
  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(OWNER_EMAIL)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phone: payload.phone || 'Not provided',
      message: payload.body,
      _subject: `[Admin Request] Approval Code: ${payload.approvalCode}`,
      _replyto: payload.email,
      _captcha: 'false',
      _template: 'table',
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === 'false' || data.success === false) {
    throw new Error(data.message || 'FormSubmit failed')
  }
  return 'formsubmit'
}

async function sendViaFormspree(payload) {
  const res = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phone: payload.phone || 'Not provided',
      subject: `[Admin Request] Code: ${payload.approvalCode}`,
      message: payload.body,
      _subject: `[Admin Request] Code: ${payload.approvalCode}`,
      _replyto: payload.email,
    }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Formspree failed')
  }
  return 'formspree'
}

export async function sendAdminRequestEmail({ name, email, phone, message, approvalCode }) {
  const body = buildEmailBody({ name, email, phone, message, approvalCode })
  const payload = { name, email, phone, message, body, approvalCode }

  const errors = []
  for (const send of [() => sendViaWeb3Forms(payload), () => sendViaFormSubmit(payload), () => sendViaFormspree(payload)]) {
    try {
      const used = await send()
      if (used) return { ok: true, approvalCode, provider: used }
    } catch (err) {
      errors.push(err.message)
    }
  }

  throw new Error(errors.join(' | ') || 'Email send failed')
}

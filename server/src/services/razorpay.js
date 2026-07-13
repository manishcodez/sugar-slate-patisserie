import crypto from 'crypto'

const KEY_ID = process.env.RAZORPAY_KEY_ID || ''
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ''

export function isRazorpayConfigured() {
  return Boolean(KEY_ID && KEY_SECRET)
}

export function getRazorpayKeyId() {
  return KEY_ID
}

export async function createRazorpayOrder(amountInr, receipt) {
  if (!isRazorpayConfigured()) {
    throw new Error('Razorpay is not configured')
  }

  const amountPaise = Math.round(Number(amountInr) * 100)
  if (amountPaise < 100) {
    throw new Error('Minimum order amount is ₹1')
  }

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64')}`,
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt: receipt || `ss_${Date.now()}`,
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data?.error?.description || data?.error || 'Could not create Razorpay order')
  }

  return data
}

export function verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  if (!isRazorpayConfigured()) return false
  const body = `${razorpay_order_id}|${razorpay_payment_id}`
  const expected = crypto.createHmac('sha256', KEY_SECRET).update(body).digest('hex')
  return expected === razorpay_signature
}

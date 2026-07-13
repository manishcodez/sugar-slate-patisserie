import { Router } from 'express'
import db, { newId, parseJson, createNotification } from '../db.js'
import { authRequired, authOptional } from '../middleware/auth.js'

const router = Router()

const TRACKING_STAGES = ['preparing', 'baking', 'ready', 'delivery']

function formatOrder(row) {
  const payload = parseJson(row.payload, {})
  return {
    ...payload,
    id: row.id,
    userId: row.user_id,
    type: row.type,
    status: row.status,
    total: row.total,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    createdAt: row.created_at,
    timeline: parseJson(row.timeline, []),
  }
}

function defaultTimeline(status = 'preparing') {
  const idx = Math.max(0, TRACKING_STAGES.indexOf(status))
  return TRACKING_STAGES.slice(0, idx + 1).map((stage, i) => ({
    stage,
    at: new Date(Date.now() - (idx - i) * 3600000).toISOString(),
    done: true,
  }))
}

router.get('/', authRequired, (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM orders WHERE user_id = ? OR customer_email = ?
    ORDER BY created_at DESC
  `).all(req.user.id, req.user.email)
  res.json({ orders: rows.map(formatOrder) })
})

router.post('/', authOptional, (req, res) => {
  const body = req.body || {}
  const id = body.id || newId('ORD')
  const now = new Date().toISOString()
  const status = body.status || 'preparing'
  const timeline = JSON.stringify(body.timeline || defaultTimeline(status))
  const payload = JSON.stringify(body)

  db.prepare(`
    INSERT INTO orders (
      id, user_id, type, status, total, customer_name, customer_email, customer_phone,
      payload, timeline, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    req.user?.id || body.userId || null,
    body.type || 'checkout',
    status,
    Number(body.total) || 0,
    body.customerName || body.customer_name || req.user?.name || '',
    body.customerEmail || body.customer_email || req.user?.email || '',
    body.customerPhone || body.customer_phone || '',
    payload,
    timeline,
    now,
  )

  if (req.user?.id) {
    createNotification(req.user.id, 'Order Confirmed', `Your order ${id} has been placed successfully.`)
  }

  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id)
  res.status(201).json(formatOrder(row))
})

router.get('/:id', authOptional, (req, res) => {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Order not found' })
  if (req.user && row.user_id && row.user_id !== req.user.id && row.customer_email !== req.user.email) {
    return res.status(403).json({ error: 'Access denied' })
  }
  res.json(formatOrder(row))
})

router.get('/:id/tracking', authOptional, (req, res) => {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Order not found' })

  const guestEmail = String(req.query.email || '').trim().toLowerCase()
  const ownsOrder = req.user && (
    row.user_id === req.user.id || row.customer_email === req.user.email
  )
  const guestMatch = !req.user && guestEmail && row.customer_email?.toLowerCase() === guestEmail

  if (!ownsOrder && !guestMatch) {
    return res.status(403).json({ error: 'Enter the email used for this order to track it' })
  }

  res.json({
    orderId: row.id,
    status: row.status,
    timeline: parseJson(row.timeline, defaultTimeline(row.status)),
    estimatedDelivery: null,
  })
})

export default router

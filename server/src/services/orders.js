import db, { newId, parseJson, createNotification } from '../db.js'
import { redeemLoyalty, earnLoyalty } from './loyalty.js'

const TRACKING_STAGES = ['preparing', 'baking', 'ready', 'delivery', 'delivered']

export function createOrder(body, user) {
  const id = newId('ORD')
  const now = new Date().toISOString()
  const status = body.status || 'preparing'
  const timeline = JSON.stringify([
    { stage: 'preparing', at: now, done: true },
  ])

  let pointsRedeemed = 0
  if (user?.id && body.pointsRedeemed > 0) {
    const subtotal = Number(body.subtotal) || Number(body.total) || 0
    pointsRedeemed = redeemLoyalty(user.id, body.pointsRedeemed, subtotal, id)
  }

  const payload = JSON.stringify({ ...body, pointsRedeemed })

  db.prepare(`
    INSERT INTO orders (
      id, user_id, type, status, total, customer_name, customer_email, customer_phone,
      payload, timeline, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    user?.id || null,
    body.type || 'checkout',
    status,
    Number(body.total) || 0,
    body.customerName || body.deliveryInfo?.name || user?.name || '',
    body.customerEmail || body.deliveryInfo?.email || user?.email || '',
    body.customerPhone || body.deliveryInfo?.phone || '',
    payload,
    timeline,
    now,
  )

  if (user?.id) {
    createNotification(user.id, 'Order Confirmed', `Your order ${id} has been placed successfully.`)
    earnLoyalty(user.id, Number(body.total) || 0, id)
  }

  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id)
  const parsed = parseJson(row.payload, {})
  return {
    ...parsed,
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
    pointsRedeemed,
  }
}

export function formatOrder(row) {
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

export function updateOrderStatus(orderId, status) {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId)
  if (!row) return null

  const timeline = parseJson(row.timeline, [])
  const stageIdx = TRACKING_STAGES.indexOf(status)
  if (stageIdx >= 0) {
    const existing = timeline.findIndex((t) => t.stage === status)
    if (existing === -1) {
      timeline.push({ stage: status, at: new Date().toISOString(), done: true })
    }
  }

  const payload = parseJson(row.payload, {})
  payload.status = status

  db.prepare('UPDATE orders SET status = ?, timeline = ?, payload = ? WHERE id = ?')
    .run(status, JSON.stringify(timeline), JSON.stringify(payload), orderId)

  if (row.user_id) {
    createNotification(row.user_id, 'Order Update', `Your order ${orderId} is now: ${status}.`)
  }

  return formatOrder(db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId))
}

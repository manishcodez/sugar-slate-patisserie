import db, { parseJson, newId } from '../db.js'

export const POINTS_PER_100 = 1

export function getLoyalty(userId) {
  const row = db.prepare('SELECT * FROM loyalty WHERE user_id = ?').get(userId)
  if (!row) return { points: 0, history: [] }
  return { points: row.points, history: parseJson(row.history, []) }
}

function saveLoyalty(userId, points, history) {
  const exists = db.prepare('SELECT user_id FROM loyalty WHERE user_id = ?').get(userId)
  const trimmed = history.slice(0, 20)
  if (exists) {
    db.prepare('UPDATE loyalty SET points = ?, history = ? WHERE user_id = ?').run(points, JSON.stringify(trimmed), userId)
  } else {
    db.prepare('INSERT INTO loyalty (user_id, points, history) VALUES (?, ?, ?)').run(userId, points, JSON.stringify(trimmed))
  }
}

export function maxRedeemable(points, orderSubtotal) {
  return Math.min(points, Math.floor(orderSubtotal * 0.5))
}

export function redeemLoyalty(userId, requestedPoints, orderSubtotal, orderId) {
  const { points, history } = getLoyalty(userId)
  const redeem = Math.min(requestedPoints || 0, maxRedeemable(points, orderSubtotal))
  if (redeem <= 0) return 0

  saveLoyalty(userId, points - redeem, [
    { id: newId('redeem'), type: 'redeem', points: redeem, orderId, date: new Date().toISOString() },
    ...history,
  ])
  return redeem
}

export function earnLoyalty(userId, paidTotal, orderId) {
  const earned = Math.floor(Number(paidTotal) / 100) * POINTS_PER_100
  if (earned <= 0) return 0

  const { points, history } = getLoyalty(userId)
  saveLoyalty(userId, points + earned, [
    { id: newId('earn'), type: 'earn', points: earned, orderId, orderTotal: paidTotal, date: new Date().toISOString() },
    ...history,
  ])
  return earned
}

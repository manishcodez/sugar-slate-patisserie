import { Router } from 'express'
import db, { newId } from '../db.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

function formatNotification(row) {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    body: row.message,
    read: Boolean(row.read),
    createdAt: row.created_at,
  }
}

router.get('/', authRequired, (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM notifications WHERE user_id = ?
    ORDER BY created_at DESC LIMIT 50
  `).all(req.user.id)
  res.json({ notifications: rows.map(formatNotification) })
})

router.patch('/:id/read', authRequired, (req, res) => {
  const result = db.prepare(`
    UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?
  `).run(req.params.id, req.user.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Notification not found' })
  res.json({ ok: true })
})

router.post('/read-all', authRequired, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user.id)
  res.json({ ok: true })
})

export default router

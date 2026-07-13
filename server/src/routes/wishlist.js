import { Router } from 'express'
import db from '../db.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

router.get('/', authRequired, (req, res) => {
  const rows = db.prepare('SELECT product_id FROM wishlist WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id)
  res.json({ items: rows.map((r) => r.product_id) })
})

router.post('/', authRequired, (req, res) => {
  const productId = String(req.body.productId || '')
  if (!productId) return res.status(400).json({ error: 'productId is required' })

  const exists = db.prepare('SELECT 1 FROM wishlist WHERE user_id = ? AND product_id = ?')
    .get(req.user.id, productId)
  if (!exists) {
    db.prepare('INSERT INTO wishlist (user_id, product_id, created_at) VALUES (?, ?, ?)')
      .run(req.user.id, productId, new Date().toISOString())
  }

  const rows = db.prepare('SELECT product_id FROM wishlist WHERE user_id = ?').all(req.user.id)
  res.json({ items: rows.map((r) => r.product_id) })
})

router.delete('/:productId', authRequired, (req, res) => {
  db.prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?')
    .run(req.user.id, req.params.productId)
  const rows = db.prepare('SELECT product_id FROM wishlist WHERE user_id = ?').all(req.user.id)
  res.json({ items: rows.map((r) => r.product_id) })
})

export default router

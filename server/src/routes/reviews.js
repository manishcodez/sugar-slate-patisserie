import { Router } from 'express'
import db, { newId } from '../db.js'
import { authOptional } from '../middleware/auth.js'

const router = Router()

router.get('/', (req, res) => {
  const { productId, approvedOnly } = req.query
  const onlyApproved = approvedOnly !== 'false'
  let rows
  if (productId) {
    rows = onlyApproved
      ? db.prepare('SELECT * FROM reviews WHERE product_id = ? AND approved = 1 ORDER BY created_at DESC LIMIT 50').all(String(productId))
      : db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC LIMIT 50').all(String(productId))
  } else {
    rows = onlyApproved
      ? db.prepare('SELECT * FROM reviews WHERE approved = 1 ORDER BY created_at DESC LIMIT 50').all()
      : db.prepare('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 50').all()
  }
  res.json({
    reviews: rows.map((r) => ({
      id: r.id,
      name: r.name,
      quote: r.quote,
      rating: r.rating,
      photo: r.photo,
      productId: r.product_id,
      approved: Boolean(r.approved),
      createdAt: r.created_at,
    })),
  })
})

router.post('/', authOptional, (req, res) => {
  const { name, quote, rating, photo, productId } = req.body || {}
  if (!name?.trim() || !quote?.trim()) {
    return res.status(400).json({ error: 'Name and review are required' })
  }
  const stars = Number(rating)
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' })
  }
  if (photo && String(photo).length > 500000) {
    return res.status(400).json({ error: 'Photo is too large' })
  }

  const id = newId('review')
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO reviews (id, user_id, name, quote, rating, photo, product_id, created_at, approved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).run(id, req.user?.id || null, name.trim(), quote.trim(), stars, photo || null, productId || null, now)

  res.status(201).json({
    id,
    name: name.trim(),
    quote: quote.trim(),
    rating: stars,
    approved: false,
    message: 'Thank you! Your review will appear after approval.',
    createdAt: now,
  })
})

export default router

import { Router } from 'express'
import db from '../db.js'

const router = Router()

function formatProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    originalPrice: row.original_price || null,
    category: row.category,
    badge: row.badge || null,
    imageKey: row.image_key,
    rating: row.rating,
    reviewCount: row.review_count,
    popularity: row.popularity,
  }
}

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY popularity DESC, id ASC').all()
  res.json({ products: rows.map(formatProduct) })
})

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(req.params.id))
  if (!row) return res.status(404).json({ error: 'Product not found' })
  res.json(formatProduct(row))
})

export default router

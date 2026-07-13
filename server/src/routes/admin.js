import { Router } from 'express'
import db, { publicUser, parseJson, createNotification } from '../db.js'
import { authRequired } from '../middleware/auth.js'
import { adminRequired } from '../middleware/admin.js'
import { formatOrder, updateOrderStatus } from '../services/orders.js'
import { SEED_PRODUCTS } from '../data/seedProducts.js'

const router = Router()

router.use(authRequired, adminRequired)

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

router.get('/customers', (_req, res) => {
  const rows = db.prepare(`
    SELECT id, name, email, phone, role, created_at
    FROM users WHERE role = 'user' ORDER BY created_at DESC
  `).all()
  res.json({ customers: rows.map((row) => publicUser(row)), total: rows.length })
})

router.patch('/customers/:id/make-admin', (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'User not found' })
  if (row.role === 'admin') return res.status(400).json({ error: 'User is already an admin' })
  db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(req.params.id)
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  createNotification(updated.id, 'Admin Access Granted', 'You now have admin access to the Sugar & Slate dashboard.')
  res.json({ user: publicUser(updated) })
})

router.get('/customers/stats', (_req, res) => {
  const total = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'user'").get().c
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayCount = db.prepare(`
    SELECT COUNT(*) as c FROM users WHERE role = 'user' AND created_at >= ?
  `).get(today.toISOString()).c
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const weekCount = db.prepare(`
    SELECT COUNT(*) as c FROM users WHERE role = 'user' AND created_at >= ?
  `).get(weekAgo).c
  res.json({ total, today: todayCount, thisWeek: weekCount })
})

router.get('/orders', (_req, res) => {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 500').all()
  res.json({ orders: rows.map(formatOrder) })
})

router.patch('/orders/:id/status', (req, res) => {
  const status = String(req.body.status || '').trim()
  const valid = ['preparing', 'baking', 'ready', 'delivery', 'delivered', 'confirmed', 'cancelled']
  if (!valid.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  const updated = updateOrderStatus(req.params.id, status)
  if (!updated) return res.status(404).json({ error: 'Order not found' })
  res.json(updated)
})

router.get('/products', (_req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY id ASC').all()
  res.json({ products: rows.map(formatProduct) })
})

router.post('/products', (req, res) => {
  const b = req.body || {}
  if (!b.name?.trim() || !b.price || !b.category?.trim()) {
    return res.status(400).json({ error: 'Name, price, and category are required' })
  }
  const maxId = db.prepare('SELECT MAX(id) as m FROM products').get().m || 99
  const id = maxId + 1
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO products (
      id, name, description, price, original_price, category, badge,
      image_key, rating, review_count, popularity, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, b.name.trim(), b.description || '', Number(b.price), b.originalPrice || null,
    b.category.trim(), b.badge || null, b.imageKey || 'default',
    Number(b.rating) || 4.5, Number(b.reviewCount) || 0, Number(b.popularity) || 50, now, now,
  )
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
  res.status(201).json(formatProduct(row))
})

router.put('/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(req.params.id))
  if (!row) return res.status(404).json({ error: 'Product not found' })
  const b = req.body || {}
  const now = new Date().toISOString()
  db.prepare(`
    UPDATE products SET
      name = ?, description = ?, price = ?, original_price = ?, category = ?,
      badge = ?, image_key = ?, rating = ?, review_count = ?, popularity = ?, updated_at = ?
    WHERE id = ?
  `).run(
    b.name ?? row.name,
    b.description ?? row.description,
    b.price ?? row.price,
    b.originalPrice ?? row.original_price,
    b.category ?? row.category,
    b.badge ?? row.badge,
    b.imageKey ?? row.image_key,
    b.rating ?? row.rating,
    b.reviewCount ?? row.review_count,
    b.popularity ?? row.popularity,
    now,
    row.id,
  )
  res.json(formatProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(row.id)))
})

router.delete('/products/:id', (req, res) => {
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(Number(req.params.id))
  if (result.changes === 0) return res.status(404).json({ error: 'Product not found' })
  res.json({ ok: true })
})

router.post('/products/reset', (_req, res) => {
  db.prepare('DELETE FROM products').run()
  const now = new Date().toISOString()
  const insert = db.prepare(`
    INSERT INTO products (
      id, name, description, price, original_price, category, badge,
      image_key, rating, review_count, popularity, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const p of SEED_PRODUCTS) {
    insert.run(
      p.id, p.name, p.description, p.price, p.original_price, p.category, p.badge,
      p.image_key, p.rating, p.review_count, p.popularity, now, now,
    )
  }
  const rows = db.prepare('SELECT * FROM products ORDER BY id ASC').all()
  res.json({ products: rows.map(formatProduct) })
})

router.get('/custom-cakes', (_req, res) => {
  const rows = db.prepare('SELECT * FROM custom_cake_requests ORDER BY created_at DESC LIMIT 50').all()
  res.json({
    requests: rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      status: r.status,
      estimatedMin: r.estimated_min,
      estimatedMax: r.estimated_max,
      payload: parseJson(r.payload, {}),
      createdAt: r.created_at,
    })),
  })
})

router.patch('/custom-cakes/:id/status', (req, res) => {
  const status = String(req.body.status || '').trim()
  if (!status) return res.status(400).json({ error: 'Status is required' })
  const result = db.prepare('UPDATE custom_cake_requests SET status = ? WHERE id = ?').run(status, req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Request not found' })
  const row = db.prepare('SELECT * FROM custom_cake_requests WHERE id = ?').get(req.params.id)
  res.json({ id: row.id, status: row.status })
})

router.get('/messages', (_req, res) => {
  const contact = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 30').all()
  const feedback = db.prepare('SELECT * FROM feedback ORDER BY created_at DESC LIMIT 30').all()
  res.json({
    contact: contact.map((m) => ({
      id: m.id, type: 'contact', name: m.name, email: m.email,
      phone: m.phone, subject: m.subject, message: m.message, createdAt: m.created_at,
    })),
    feedback: feedback.map((m) => ({
      id: m.id, type: 'feedback', name: m.name, email: m.email,
      category: m.category, rating: m.rating, message: m.message, createdAt: m.created_at,
    })),
  })
})

router.get('/newsletter', (_req, res) => {
  const rows = db.prepare('SELECT email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC LIMIT 500').all()
  res.json({
    subscribers: rows.map((r) => ({ email: r.email, subscribedAt: r.subscribed_at })),
    total: rows.length,
  })
})

router.get('/reviews', (_req, res) => {
  const rows = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 200').all()
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

router.patch('/reviews/:id/approve', (req, res) => {
  const approved = req.body.approved !== false ? 1 : 0
  const result = db.prepare('UPDATE reviews SET approved = ? WHERE id = ?').run(approved, req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Review not found' })
  res.json({ id: req.params.id, approved: Boolean(approved) })
})

router.delete('/reviews/:id', (req, res) => {
  const result = db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Review not found' })
  res.json({ deleted: true })
})

export default router

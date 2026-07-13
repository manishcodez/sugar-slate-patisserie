import { Router } from 'express'
import db, { newId } from '../db.js'

const router = Router()

router.post('/', (req, res) => {
  const { name, email, category, rating, message } = req.body || {}
  if (!name?.trim() || !email?.trim() || !category?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Please fill all required fields' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email' })
  }

  const id = newId('feedback')
  db.prepare(`
    INSERT INTO feedback (id, name, email, category, rating, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, name.trim(), email.trim(), category.trim(),
    Number(rating) || 5, message.trim(), new Date().toISOString(),
  )

  res.status(201).json({ id, message: 'Thank you for your feedback!' })
})

export default router

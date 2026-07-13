import { Router } from 'express'
import db, { newId } from '../db.js'

const router = Router()

router.post('/', (req, res) => {
  const { name, email, phone, subject, message } = req.body || {}
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Name, email, and message are required' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email' })
  }

  const id = newId('contact')
  db.prepare(`
    INSERT INTO contact_messages (id, name, email, phone, subject, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name.trim(), email.trim(), phone || '', subject || '', message.trim(), new Date().toISOString())

  res.status(201).json({ id, message: 'Message received. We will respond within 24 hours.' })
})

export default router

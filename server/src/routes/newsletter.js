import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.post('/subscribe', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email' })
  }

  db.prepare(`
    INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES (?, ?)
    ON CONFLICT(email) DO UPDATE SET subscribed_at = excluded.subscribed_at
  `).run(email, new Date().toISOString())

  res.json({ subscribed: true, message: "You're subscribed!" })
})

router.post('/unsubscribe', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  if (!email) return res.status(400).json({ error: 'Email is required' })
  db.prepare('DELETE FROM newsletter_subscribers WHERE email = ?').run(email)
  res.json({ unsubscribed: true })
})

export default router

import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db, { newId, publicUser } from '../db.js'
import { authRequired, signToken } from '../middleware/auth.js'
import { sendPasswordResetEmail, isEmailConfigured } from '../services/email.js'

const router = Router()

const RESET_MAX_AGE_MS = 24 * 60 * 60 * 1000

function authResponse(user) {
  return { token: signToken(user), user: publicUser(user) }
}

router.post('/register', (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  if (!name) return res.status(400).json({ error: 'Please enter your name' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (exists) return res.status(409).json({ error: 'An account with this email already exists' })

  const now = new Date().toISOString()
  const user = {
    id: newId('user'),
    name,
    email,
    password_hash: bcrypt.hashSync(password, 10),
    role: 'user',
    phone: '',
    created_at: now,
  }

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, phone, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(user.id, user.name, user.email, user.password_hash, user.role, user.phone, user.created_at)

  db.prepare('INSERT INTO loyalty (user_id, points, history) VALUES (?, 0, ?)').run(user.id, '[]')

  res.status(201).json(authResponse(user))
})

router.post('/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  res.json(authResponse(user))
})

router.post('/logout', authRequired, (_req, res) => {
  res.json({ ok: true })
})

router.get('/me', authRequired, (req, res) => {
  res.json({ user: req.user })
})

router.put('/profile', authRequired, (req, res) => {
  const name = String(req.body.name || '').trim()
  const phone = String(req.body.phone || '').trim()

  if (!name) return res.status(400).json({ error: 'Name is required' })

  db.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?').run(name, phone, req.user.id)
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  res.json({ user: publicUser(updated) })
})

router.post('/forgot-password', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email' })
  }

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  let devResetToken
  if (user) {
    const token = newId('reset')
    const expires = new Date(Date.now() + RESET_MAX_AGE_MS).toISOString()
    db.prepare(`
      INSERT INTO password_resets (id, user_id, token, expires_at, used, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run(newId('pr'), user.id, token, expires, new Date().toISOString())
    sendPasswordResetEmail({ email, token }).catch(() => {})
    if (process.env.ALLOW_DEV_RESET === 'true' && !isEmailConfigured()) {
      devResetToken = token
    }
  }

  res.json({
    message: 'If an account exists, password reset instructions have been sent to your email.',
    ...(devResetToken ? { devResetToken, email } : {}),
  })
})

router.post('/reset-password', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  const token = String(req.body.token || '').trim()

  if (!token) {
    return res.status(400).json({ error: 'Reset token is required. Check your email after using Forgot Password.' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user) return res.status(404).json({ error: 'No account found with this email' })

  const reset = db.prepare(`
    SELECT * FROM password_resets
    WHERE token = ? AND user_id = ? AND used = 0
    ORDER BY created_at DESC LIMIT 1
  `).get(token, user.id)

  if (!reset || new Date(reset.expires_at).getTime() < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired reset token. Please request a new one.' })
  }

  const hash = bcrypt.hashSync(password, 10)
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id)
  db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(reset.id)

  res.json({ message: 'Password updated successfully. You can login now.' })
})

export default router

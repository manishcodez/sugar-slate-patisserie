import jwt from 'jsonwebtoken'
import db, { publicUser } from '../db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-in-production'

export function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' },
  )
}

export function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId)
    if (!user) return res.status(401).json({ error: 'User not found' })
    req.user = publicUser(user)
    req.userRow = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function authOptional(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    req.user = null
    return next()
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId)
    req.user = user ? publicUser(user) : null
    req.userRow = user || null
  } catch {
    req.user = null
    req.userRow = null
  }
  next()
}

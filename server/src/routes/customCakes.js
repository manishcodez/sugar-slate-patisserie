import { Router } from 'express'
import db, { newId, parseJson, createNotification } from '../db.js'
import { authOptional } from '../middleware/auth.js'
import { CAKE_OPTIONS, estimateCakePrice } from '../data/cakeOptions.js'

const router = Router()

router.get('/options', (_req, res) => {
  res.json(CAKE_OPTIONS)
})

router.post('/estimate', (req, res) => {
  const estimate = estimateCakePrice(req.body || {})
  res.json(estimate)
})

router.post('/', authOptional, (req, res) => {
  const body = req.body || {}
  const id = newId('CC')
  const now = new Date().toISOString()
  const estimate = body.estimatedPrice || estimateCakePrice(body)

  db.prepare(`
    INSERT INTO custom_cake_requests (id, user_id, status, estimated_min, estimated_max, payload, created_at)
    VALUES (?, ?, 'pending', ?, ?, ?, ?)
  `).run(
    id,
    req.user?.id || null,
    estimate.min || 0,
    estimate.max || 0,
    JSON.stringify(body),
    now,
  )

  if (req.user?.id) {
    createNotification(
      req.user.id,
      'Custom Cake Request Received',
      `Your custom cake request ${id} has been submitted. Our team will respond within 24–48 hours.`,
    )
  }

  res.status(201).json({
    id,
    status: 'pending',
    estimatedPrice: estimate,
    createdAt: now,
    ...parseJson(JSON.stringify(body), {}),
  })
})

export default router

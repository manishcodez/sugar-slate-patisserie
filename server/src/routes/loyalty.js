import { Router } from 'express'
import db, { parseJson } from '../db.js'
import { authRequired } from '../middleware/auth.js'
import { getLoyalty } from '../services/loyalty.js'

const router = Router()

router.get('/', authRequired, (req, res) => {
  const loyalty = getLoyalty(req.user.id)
  res.json(loyalty)
})

export default router

import { Router } from 'express'
import { authOptional } from '../middleware/auth.js'
import { createOrder } from '../services/orders.js'
import { calculateCheckoutTotals } from '../services/checkoutValidation.js'
import { sendOrderConfirmationEmail } from '../services/email.js'

const router = Router()

router.post('/validate', authOptional, (req, res) => {
  const result = calculateCheckoutTotals(req.body, req.user)
  if (!result.valid) {
    return res.status(400).json({ valid: false, error: result.error })
  }
  res.json({ valid: true, totals: result })
})

router.post('/', authOptional, (req, res) => {
  const result = calculateCheckoutTotals(req.body, req.user)
  if (!result.valid) {
    return res.status(400).json({ error: result.error })
  }

  const clientTotal = Number(req.body.total)
  if (Math.abs(clientTotal - result.total) > 1) {
    return res.status(400).json({
      error: 'Order total mismatch. Please refresh and try again.',
      expectedTotal: result.total,
    })
  }

  const order = createOrder(
    {
      ...req.body,
      items: result.items,
      subtotal: result.subtotal,
      deliveryFee: result.deliveryFee,
      couponDiscount: result.couponDiscount,
      loyaltyDiscount: result.loyaltyDiscount,
      pointsRedeemed: result.pointsRedeemed,
      total: result.total,
    },
    req.user,
  )

  const email = order.customerEmail || req.body?.deliveryInfo?.email
  if (email) {
    sendOrderConfirmationEmail({
      email,
      name: order.customerName,
      orderId: order.id,
      total: order.total,
    }).catch(() => {})
  }

  res.status(201).json(order)
})

export default router

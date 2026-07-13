import { Router } from 'express'
import { authOptional } from '../middleware/auth.js'
import { createOrder } from '../services/orders.js'
import { calculateCheckoutTotals } from '../services/checkoutValidation.js'
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  isRazorpayConfigured,
  verifyRazorpaySignature,
} from '../services/razorpay.js'
import { sendOrderConfirmationEmail } from '../services/email.js'

const router = Router()

router.get('/config', (_req, res) => {
  res.json({
    razorpayEnabled: isRazorpayConfigured(),
    keyId: isRazorpayConfigured() ? getRazorpayKeyId() : '',
    demoMode: !isRazorpayConfigured(),
  })
})

router.post('/razorpay/create-order', authOptional, async (req, res) => {
  if (!isRazorpayConfigured()) {
    return res.status(503).json({ error: 'Razorpay not configured', demoMode: true })
  }

  const amount = Number(req.body?.amount)
  if (!amount || amount < 1) {
    return res.status(400).json({ error: 'Valid amount is required' })
  }

  try {
    const receipt = `ss_${Date.now()}`
    const order = await createRazorpayOrder(amount, receipt)
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
    })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not create payment order' })
  }
})

router.post('/razorpay/verify', authOptional, async (req, res) => {
  if (!isRazorpayConfigured()) {
    return res.status(503).json({ error: 'Razorpay not configured' })
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    checkout,
  } = req.body || {}

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification data is incomplete' })
  }

  if (!verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature })) {
    return res.status(400).json({ error: 'Payment verification failed' })
  }

  if (!checkout || !Array.isArray(checkout.items) || checkout.items.length === 0) {
    return res.status(400).json({ error: 'Checkout data is invalid' })
  }

  const totals = calculateCheckoutTotals(checkout, req.user)
  if (!totals.valid) {
    return res.status(400).json({ error: totals.error })
  }

  try {
    const order = createOrder(
      {
        ...checkout,
        items: totals.items,
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        couponDiscount: totals.couponDiscount,
        loyaltyDiscount: totals.loyaltyDiscount,
        pointsRedeemed: totals.pointsRedeemed,
        total: totals.total,
        status: 'preparing',
        payment: {
          provider: 'razorpay',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          paidAt: new Date().toISOString(),
        },
      },
      req.user,
    )

    const customerEmail = order.customerEmail || checkout.deliveryInfo?.email
    if (customerEmail) {
      sendOrderConfirmationEmail({
        email: customerEmail,
        name: order.customerName,
        orderId: order.id,
        total: order.total,
      }).catch(() => {})
    }

    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not complete order' })
  }
})

export default router

import db from '../db.js'
import { validateCouponCode } from '../data/coupons.js'
import { checkPincode } from '../data/deliveryZones.js'
import { maxRedeemable, getLoyalty } from './loyalty.js'

export function calculateCheckoutTotals(body, user) {
  const items = Array.isArray(body.items) ? body.items : []
  if (items.length === 0) {
    return { valid: false, error: 'Cart is empty' }
  }

  const deliveryInfo = body.deliveryInfo || {}
  if (!deliveryInfo.name?.trim()) {
    return { valid: false, error: 'Customer name is required' }
  }

  let subtotal = 0
  for (const item of items) {
    const product = db.prepare('SELECT id, price, name FROM products WHERE id = ?').get(item.id)
    const unitPrice = product ? product.price : Number(item.price)
    if (!unitPrice || unitPrice <= 0) {
      return { valid: false, error: `Invalid price for item: ${item.name || item.id}` }
    }
    const qty = Math.max(1, Math.min(99, Number(item.quantity) || 1))
    subtotal += unitPrice * qty
  }

  let deliveryFee = 0
  if (deliveryInfo.deliveryType === 'delivery') {
    const pin = checkPincode(deliveryInfo.pincode)
    if (!pin.available) {
      return { valid: false, error: pin.message || 'Delivery not available for this pincode' }
    }
    deliveryFee = pin.fee
  }

  let couponDiscount = 0
  if (body.couponCode) {
    const couponResult = validateCouponCode(body.couponCode, subtotal)
    if (!couponResult.valid) {
      return { valid: false, error: couponResult.error || 'Invalid coupon' }
    }
    couponDiscount = couponResult.discount
  }

  let pointsRedeemed = 0
  let loyaltyDiscount = 0
  if (user?.id && body.pointsRedeemed > 0) {
    const { points } = getLoyalty(user.id)
    pointsRedeemed = Math.min(
      Number(body.pointsRedeemed) || 0,
      maxRedeemable(points, subtotal),
    )
    loyaltyDiscount = pointsRedeemed
  }

  const total = Math.max(0, subtotal + deliveryFee - couponDiscount - loyaltyDiscount)

  return {
    valid: true,
    subtotal,
    deliveryFee,
    couponDiscount,
    loyaltyDiscount,
    pointsRedeemed,
    total,
    items: items.map((item) => {
      const product = db.prepare('SELECT price FROM products WHERE id = ?').get(item.id)
      return {
        ...item,
        price: product ? product.price : Number(item.price),
        quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1)),
      }
    }),
  }
}

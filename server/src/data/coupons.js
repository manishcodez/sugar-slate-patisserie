export const COUPONS = {
  FIRST10: { code: 'FIRST10', type: 'percent', value: 10, minOrder: 500 },
  DIWALI15: { code: 'DIWALI15', type: 'percent', value: 15, minOrder: 1000 },
  SLATE50: { code: 'SLATE50', type: 'flat', value: 50, minOrder: 800 },
}

export function validateCouponCode(code, subtotal) {
  const normalized = String(code || '').trim().toUpperCase()
  if (!normalized) return { valid: false, discount: 0 }
  const coupon = COUPONS[normalized]
  if (!coupon) return { valid: false, discount: 0, error: 'Invalid coupon code' }
  if (subtotal < coupon.minOrder) {
    return { valid: false, discount: 0, error: `Minimum order ₹${coupon.minOrder} required for this coupon` }
  }
  const discount = coupon.type === 'percent'
    ? Math.round(subtotal * (coupon.value / 100))
    : coupon.value
  return { valid: true, discount, coupon }
}

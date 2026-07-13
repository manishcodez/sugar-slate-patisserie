export const COUPONS = {
  FIRST10: {
    code: 'FIRST10',
    type: 'percent',
    value: 10,
    minOrder: 500,
    description: '10% off your first order',
  },
  DIWALI15: {
    code: 'DIWALI15',
    type: 'percent',
    value: 15,
    minOrder: 1000,
    description: '15% off Diwali specials',
  },
  SLATE50: {
    code: 'SLATE50',
    type: 'flat',
    value: 50,
    minOrder: 800,
    description: '₹50 off orders above ₹800',
  },
}

export function validateCoupon(code, subtotal) {
  const normalized = String(code).trim().toUpperCase()
  const coupon = COUPONS[normalized]

  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code' }
  }
  if (subtotal < coupon.minOrder) {
    return {
      valid: false,
      message: `Minimum order ₹${coupon.minOrder.toLocaleString('en-IN')} required`,
    }
  }

  const discount =
    coupon.type === 'percent'
      ? Math.round(subtotal * (coupon.value / 100))
      : coupon.value

  return {
    valid: true,
    coupon,
    discount,
    message: `${coupon.description} applied!`,
  }
}

export function calculateDiscount(appliedCoupon, subtotal) {
  if (!appliedCoupon) return 0
  if (appliedCoupon.type === 'percent') {
    return Math.round(subtotal * (appliedCoupon.value / 100))
  }
  return appliedCoupon.value
}

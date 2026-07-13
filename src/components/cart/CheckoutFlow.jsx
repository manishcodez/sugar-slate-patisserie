import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, CreditCard, MapPin, ShoppingBag, Check, Loader2, CheckCircle, XCircle, Tag, Star } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useLoyalty } from '../../context/LoyaltyContext'
import { useFocusTrap, useScrollLock } from '../../hooks/useFocusTrap'
import { isValidEmail, isValidPhone } from '../../utils/validation'
import { checkPincode } from '../../data/deliveryZones'
import { validateCoupon, calculateDiscount } from '../../data/coupons'
import { useNotification } from '../../context/NotificationContext'
import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../context/OrdersContext'
import { submitCheckoutApi, validateCheckoutApi } from '../../services/api/checkoutApi'
import { fetchPaymentConfigApi, createRazorpayOrderApi, verifyRazorpayPaymentApi } from '../../services/api/paymentsApi'
import { openRazorpayCheckout } from '../../services/payments/razorpay'
import { trackOrderApi } from '../../services/api/ordersApi'
import { API_ENABLED } from '../../config/api'
import { ORDER_TRACKING_STAGES, getOrderTrackingIndex, isOrderTrackingComplete } from '../../data/cakeBuilder'
import { fetchAddressesApi, migrateLegacyAddresses } from '../../services/api/addressesApi'
import Button from '../ui/Button'
import OrderTracker, { useOrderTracking } from './OrderTracker'

const CHECKOUT_STEPS = [
  { id: 'review', label: 'Cart Review' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'payment', label: 'Payment' },
  { id: 'confirmation', label: 'Confirmation' },
  { id: 'tracking', label: 'Tracking' },
]

function StepIndicator({ current }) {
  const idx = CHECKOUT_STEPS.findIndex((s) => s.id === current)
  return (
    <div className="mb-6 flex items-center justify-center gap-1">
      {CHECKOUT_STEPS.slice(0, 4).map((step, i) => (
        <div key={step.id} className="flex items-center gap-1">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              i <= idx ? 'bg-caramel text-cream' : 'bg-blush text-espresso/40'
            }`}
          >
            {i < idx ? <Check size={14} /> : i + 1}
          </div>
          {i < 3 && <div className={`h-0.5 w-6 ${i < idx ? 'bg-caramel' : 'bg-blush'}`} />}
        </div>
      ))}
    </div>
  )
}

export default function CheckoutFlow() {
  const {
    items, subtotal, checkoutStep, setCheckoutStep, closeCheckout,
    deliveryInfo, setDeliveryInfo, activeOrder, completePayment,
    trackingIndex, setTrackingIndex, trackingComplete, setTrackingComplete,
    appliedCoupon, setAppliedCoupon,
  } = useCart()

  const {
    points, pointsToRedeem, setPointsToRedeem, earnPoints, redeemPoints,
    maxRedeemable, loyaltyDiscount, refreshLoyalty,
  } = useLoyalty()

  const { showNotification, pushInbox } = useNotification()
  const { user } = useAuth()
  const { prependOrder } = useOrders()

  const [errors, setErrors] = useState({})
  const [paying, setPaying] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [paymentConfig, setPaymentConfig] = useState({ razorpayEnabled: false, demoMode: true })
  const trapRef = useFocusTrap(!!checkoutStep)
  useScrollLock(!!checkoutStep)

  const pincodeInfo = useMemo(
    () => (deliveryInfo.deliveryType === 'delivery' && deliveryInfo.pincode.length === 6
      ? checkPincode(deliveryInfo.pincode)
      : null),
    [deliveryInfo.deliveryType, deliveryInfo.pincode],
  )

  const deliveryFee = deliveryInfo.deliveryType === 'delivery' && pincodeInfo?.available
    ? pincodeInfo.fee
    : 0

  const couponDiscount = useMemo(
    () => calculateDiscount(appliedCoupon, subtotal),
    [appliedCoupon, subtotal],
  )

  const total = Math.max(0, subtotal + deliveryFee - couponDiscount - loyaltyDiscount)

  const advanceTracking = useCallback(() => {
    setTrackingIndex((i) => Math.min(i + 1, ORDER_TRACKING_STAGES.length - 1))
  }, [setTrackingIndex])

  useOrderTracking(trackingIndex, trackingComplete || API_ENABLED, advanceTracking)

  useEffect(() => {
    if (!API_ENABLED || checkoutStep !== 'tracking' || !activeOrder?.id) return undefined

    const syncTracking = async () => {
      const trackEmail = activeOrder.customerEmail || deliveryInfo.email || user?.email || ''
      const res = await trackOrderApi(activeOrder.id, trackEmail)
      if (!res.ok) return
      const idx = getOrderTrackingIndex(res.data?.status)
      if (idx >= 0) setTrackingIndex(idx)
      if (isOrderTrackingComplete(res.data?.status)) setTrackingComplete(true)
    }

    syncTracking()
    const timer = setInterval(syncTracking, 8000)
    return () => clearInterval(timer)
  }, [checkoutStep, activeOrder?.id, activeOrder?.customerEmail, deliveryInfo.email, user?.email, setTrackingIndex, setTrackingComplete])

  useEffect(() => {
    if (!API_ENABLED || checkoutStep !== 'payment') return
    fetchPaymentConfigApi()
      .then((res) => setPaymentConfig(res.data || { razorpayEnabled: false, demoMode: true }))
      .catch(() => setPaymentConfig({ razorpayEnabled: false, demoMode: true }))
  }, [checkoutStep])

  useEffect(() => {
    if (user && checkoutStep === 'delivery') {
      setDeliveryInfo((prev) => ({
        ...prev,
        name: prev.name || user.name,
        email: prev.email || user.email,
      }))
    }
  }, [user, checkoutStep, setDeliveryInfo])

  useEffect(() => {
    if (checkoutStep !== 'delivery' || !user?.id) {
      setSavedAddresses([])
      setSelectedAddressId('')
      return undefined
    }
    let cancelled = false
    migrateLegacyAddresses(user.id)
    fetchAddressesApi(user.id).then((res) => {
      if (cancelled || !res.ok) return
      const list = Array.isArray(res.data) ? res.data : []
      setSavedAddresses(list)
      if (list.length > 0) {
        const defaultAddr = list.find((a) => a.isDefault) || list[0]
        setSelectedAddressId(defaultAddr.id)
        setDeliveryInfo((prev) => ({
          ...prev,
          name: defaultAddr.name || prev.name,
          phone: defaultAddr.phone || prev.phone,
          address: [defaultAddr.addressLine1, defaultAddr.addressLine2].filter(Boolean).join(', '),
          pincode: defaultAddr.pincode || prev.pincode,
          city: defaultAddr.city || prev.city,
          instructions: defaultAddr.instructions || prev.instructions,
        }))
      }
    })
    return () => { cancelled = true }
  }, [checkoutStep, user?.id, setDeliveryInfo])

  const applySavedAddress = useCallback((addr) => {
    if (!addr) return
    setDeliveryInfo((prev) => ({
      ...prev,
      name: addr.name || prev.name,
      phone: addr.phone || prev.phone,
      address: [addr.addressLine1, addr.addressLine2].filter(Boolean).join(', '),
      pincode: addr.pincode || prev.pincode,
      city: addr.city || prev.city,
      instructions: addr.instructions || prev.instructions,
    }))
    setErrors((prev) => ({
      ...prev,
      name: '',
      phone: '',
      address: '',
      pincode: '',
      city: '',
    }))
  }, [setDeliveryInfo])

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId)
    if (!addressId) return
    const addr = savedAddresses.find((a) => a.id === addressId)
    applySavedAddress(addr)
  }

  if (!checkoutStep) return null

  const validateDelivery = () => {
    const e = {}
    if (!deliveryInfo.name.trim()) e.name = 'Name is required'
    if (!deliveryInfo.phone.trim()) e.phone = 'Phone is required'
    else if (!isValidPhone(deliveryInfo.phone)) e.phone = 'Enter a valid phone number'
    if (!deliveryInfo.email.trim()) e.email = 'Email is required'
    else if (!isValidEmail(deliveryInfo.email)) e.email = 'Enter a valid email'
    if (deliveryInfo.deliveryType === 'delivery') {
      if (!deliveryInfo.address.trim()) e.address = 'Address is required'
      if (!deliveryInfo.pincode.trim() || !/^\d{6}$/.test(deliveryInfo.pincode.trim())) {
        e.pincode = 'Enter a valid 6-digit pincode'
      } else {
        const info = checkPincode(deliveryInfo.pincode)
        if (!info.available) e.pincode = "Sorry, we don't deliver here yet"
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleApplyCoupon = () => {
    const result = validateCoupon(couponInput, subtotal)
    if (!result.valid) {
      setCouponError(result.message)
      setCouponSuccess('')
      return
    }
    setAppliedCoupon(result.coupon)
    setCouponError('')
    setCouponSuccess(result.message)
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponError('')
    setCouponSuccess('')
  }

  const buildOrderPayload = (redeemed = 0) => ({
    items: [...items],
    subtotal,
    total,
    deliveryInfo,
    couponCode: appliedCoupon?.code,
    couponDiscount,
    loyaltyDiscount: redeemed * 1,
    pointsRedeemed: pointsToRedeem,
    deliveryFee,
    customerName: deliveryInfo.name,
    customerEmail: deliveryInfo.email,
    customerPhone: deliveryInfo.phone,
    status: 'preparing',
  })

  const finalizeOrder = async (orderData, redeemed = 0) => {
    if (orderData) {
      prependOrder(orderData)
      if (!API_ENABLED) {
        pushInbox({
          title: 'Order Confirmed',
          message: `Your order ${orderData.id || ''} has been placed successfully.`,
        })
      }
    }

    completePayment(total, {
      id: orderData?.id,
      couponCode: appliedCoupon?.code,
      couponDiscount,
      loyaltyDiscount: (orderData?.pointsRedeemed ?? redeemed) * 1,
      pointsRedeemed: orderData?.pointsRedeemed ?? redeemed,
    })
    earnPoints(total, orderData?.id)
    refreshLoyalty()
    setAppliedCoupon(null)
    setCouponInput('')
    setPaying(false)
    showNotification(
      `Order confirmed! Save your order ID (${orderData?.id?.slice(-12) || ''}) for tracking.`,
      5000,
    )
  }

  const handlePay = async () => {
    setPaying(true)

    if (API_ENABLED) {
      try {
        const validation = await validateCheckoutApi({ items, deliveryInfo, subtotal })
        if (!validation.ok || validation.data?.valid === false) {
          showNotification(validation.data?.error || 'Checkout validation failed', 4000)
          setPaying(false)
          return
        }
      } catch (err) {
        showNotification(err.message || 'Could not validate checkout', 4000)
        setPaying(false)
        return
      }
    }

    const useRazorpay = API_ENABLED && paymentConfig.razorpayEnabled

    if (useRazorpay) {
      const orderPayload = buildOrderPayload(0)
      const createRes = await createRazorpayOrderApi(total)
      if (!createRes.ok) {
        showNotification(createRes.error || 'Could not start payment', 5000)
        setPaying(false)
        return
      }

      try {
        const payment = await openRazorpayCheckout({
          key: createRes.data.keyId,
          orderId: createRes.data.orderId,
          amount: createRes.data.amount,
          currency: createRes.data.currency,
          name: deliveryInfo.name,
          email: deliveryInfo.email,
          phone: deliveryInfo.phone,
        })

        const verifyRes = await verifyRazorpayPaymentApi({
          razorpay_order_id: payment.razorpay_order_id,
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_signature: payment.razorpay_signature,
          checkout: orderPayload,
        })

        if (!verifyRes.ok) {
          showNotification(verifyRes.error || 'Payment verification failed', 5000)
          setPaying(false)
          return
        }

        await finalizeOrder(verifyRes.data, verifyRes.data?.pointsRedeemed ?? 0)
      } catch (err) {
        if (err.message !== 'Payment cancelled') {
          showNotification(err.message || 'Payment failed', 5000)
        }
        setPaying(false)
      }
      return
    }

    await new Promise((r) => setTimeout(r, 2200))
    const redeemed = pointsToRedeem > 0 ? redeemPoints(pointsToRedeem, activeOrder?.id) : 0
    const orderPayload = buildOrderPayload(redeemed)

    const res = await submitCheckoutApi(orderPayload)
    if (!res.ok) {
      showNotification(res.error || 'Order could not be placed. Please try again.', 5000)
      setPaying(false)
      return
    }

    await finalizeOrder(res.data, redeemed)
  }

  const updateDelivery = (key, value) => {
    setDeliveryInfo((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] bg-espresso/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeCheckout}
      />
      <motion.div
        ref={trapRef}
        className="fixed inset-x-4 top-[5%] z-[125] mx-auto max-h-[90vh] max-w-lg overflow-y-auto rounded-[var(--radius-lg)] bg-cream shadow-warm-lg md:inset-x-auto md:w-full"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-blush bg-cream px-6 py-4">
          <h2 className="font-display text-xl text-cocoa">
            {checkoutStep === 'tracking' ? 'Track Your Order' : 'Checkout'}
          </h2>
          <button
            type="button"
            onClick={closeCheckout}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blush text-cocoa hover:bg-caramel hover:text-cream"
            aria-label="Close checkout"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {checkoutStep !== 'tracking' && <StepIndicator current={checkoutStep} />}

          {checkoutStep === 'review' && (
            <div>
              <ul className="mb-6 max-h-60 space-y-3 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3 rounded-[var(--radius-sm)] border border-blush p-3">
                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-cocoa line-clamp-1">{item.name}</p>
                      <p className="text-sm text-espresso/60">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-caramel">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mb-6 flex justify-between border-t border-blush pt-4">
                <span className="text-espresso/70">Subtotal</span>
                <span className="font-display text-xl text-caramel">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <Button className="w-full" magnetic onClick={() => setCheckoutStep('delivery')}>
                Continue to Delivery
              </Button>
            </div>
          )}

          {checkoutStep === 'delivery' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                {['delivery', 'pickup'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateDelivery('deliveryType', type)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-sm)] border-2 py-3 text-sm font-medium capitalize ${
                      deliveryInfo.deliveryType === type ? 'border-caramel bg-caramel/10' : 'border-blush'
                    }`}
                  >
                    {type === 'delivery' ? <MapPin size={16} /> : <ShoppingBag size={16} />}
                    {type}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Full Name *</label>
                  <input value={deliveryInfo.name} onChange={(e) => updateDelivery('name', e.target.value)} className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-3 py-2.5 outline-none focus:border-caramel" />
                  {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Phone *</label>
                  <input value={deliveryInfo.phone} onChange={(e) => updateDelivery('phone', e.target.value)} className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-3 py-2.5 outline-none focus:border-caramel" />
                  {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone}</p>}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email *</label>
                <input type="email" value={deliveryInfo.email} onChange={(e) => updateDelivery('email', e.target.value)} className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-3 py-2.5 outline-none focus:border-caramel" />
                {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
              </div>
              {deliveryInfo.deliveryType === 'delivery' && (
                <>
                  {user && savedAddresses.length > 0 && (
                    <div>
                      <label className="mb-1 block text-sm font-medium">Saved Address</label>
                      <select
                        value={selectedAddressId}
                        onChange={(e) => handleAddressSelect(e.target.value)}
                        className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-3 py-2.5 text-sm outline-none focus:border-caramel"
                      >
                        <option value="">Enter a new address</option>
                        {savedAddresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>
                            {addr.label} — {addr.addressLine1}, {addr.city} ({addr.pincode})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="mb-1 block text-sm font-medium">Delivery Address *</label>
                    <textarea rows={3} value={deliveryInfo.address} onChange={(e) => updateDelivery('address', e.target.value)} className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-3 py-2.5 outline-none focus:border-caramel" />
                    {errors.address && <p className="mt-1 text-xs text-red-700">{errors.address}</p>}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Pincode *</label>
                      <input value={deliveryInfo.pincode} onChange={(e) => updateDelivery('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} inputMode="numeric" className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-3 py-2.5 outline-none focus:border-caramel" />
                      {errors.pincode && <p className="mt-1 text-xs text-red-700">{errors.pincode}</p>}
                      {pincodeInfo && !errors.pincode && (
                        <div
                          className={`mt-2 flex items-start gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-xs ${
                            pincodeInfo.available ? 'bg-sage/15 text-espresso' : 'bg-red-50 text-red-800'
                          }`}
                        >
                          {pincodeInfo.available ? (
                            <CheckCircle size={14} className="mt-0.5 shrink-0 text-sage" />
                          ) : (
                            <XCircle size={14} className="mt-0.5 shrink-0 text-red-600" />
                          )}
                          <span>
                            {pincodeInfo.available
                              ? `Delivery Available — ${pincodeInfo.area} (${pincodeInfo.zoneLabel}, ${pincodeInfo.feeLabel})`
                              : pincodeInfo.message}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">City</label>
                      <input value={deliveryInfo.city} onChange={(e) => updateDelivery('city', e.target.value)} placeholder="Varanasi" className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-3 py-2.5 outline-none focus:border-caramel" />
                    </div>
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={() => setCheckoutStep('review')} className="flex items-center gap-1">
                  <ChevronLeft size={16} /> Back
                </Button>
                <Button className="flex-1" magnetic onClick={() => validateDelivery() && setCheckoutStep('payment')}>
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {checkoutStep === 'payment' && (
            <div>
              {paymentConfig.demoMode ? (
                <div className="mb-4 rounded-[var(--radius-sm)] border border-amber-300/60 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
                  <strong>Demo Checkout</strong> — Place your order now. No real payment required.
                </div>
              ) : (
                <div className="mb-4 rounded-[var(--radius-sm)] border border-sage/40 bg-sage/10 px-4 py-3 text-center text-sm text-espresso/80">
                  Secure payment via <strong>Razorpay</strong> — UPI, Cards, Netbanking & Wallets.
                </div>
              )}

              {/* Coupon */}
              <div className="mb-4 rounded-[var(--radius-md)] border border-blush bg-cream p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Tag size={16} className="text-caramel" />
                  <span className="text-sm font-medium text-cocoa">Coupon Code</span>
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-[var(--radius-sm)] bg-sage/15 px-3 py-2">
                    <span className="text-sm font-medium text-espresso">
                      {appliedCoupon.code} — {appliedCoupon.description}
                    </span>
                    <button type="button" onClick={handleRemoveCoupon} className="text-xs text-red-700 hover:underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                      placeholder="Enter coupon code"
                      className="flex-1 rounded-[var(--radius-sm)] border border-blush bg-cream px-3 py-2 text-sm uppercase outline-none focus:border-caramel"
                    />
                    <Button type="button" variant="secondary" onClick={handleApplyCoupon}>Apply</Button>
                  </div>
                )}
                {couponError && <p className="mt-1 text-xs text-red-700">{couponError}</p>}
                {couponSuccess && <p className="mt-1 text-xs text-sage">{couponSuccess}</p>}
              </div>

              {/* Loyalty points */}
              {points > 0 && (
                <div className="mb-4 rounded-[var(--radius-md)] border border-blush bg-cream p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-caramel" fill="currentColor" />
                      <span className="text-sm font-medium text-cocoa">Redeem Points</span>
                    </div>
                    <span className="text-xs text-espresso/60">{points} pts available</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxRedeemable(subtotal)}
                    value={pointsToRedeem}
                    onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                    className="w-full accent-caramel"
                  />
                  <div className="mt-1 flex justify-between text-xs text-espresso/60">
                    <span>{pointsToRedeem} pts = ₹{loyaltyDiscount} off</span>
                    <span>Max {maxRedeemable(subtotal)} pts</span>
                  </div>
                </div>
              )}

              <div className="mb-4 rounded-[var(--radius-md)] border border-blush bg-blush/30 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-display text-lg text-cocoa">
                    {paymentConfig.demoMode ? 'Order Summary' : 'Payment'}
                  </span>
                  {paymentConfig.demoMode ? (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                      Demo
                    </span>
                  ) : (
                    <span className="rounded bg-sage/20 px-2 py-0.5 text-[10px] font-bold uppercase text-sage">
                      Live Payment
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-espresso/60">Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                  {deliveryInfo.deliveryType === 'delivery' && (
                    <div className="flex justify-between">
                      <span className="text-espresso/60">
                        Delivery
                        {pincodeInfo?.available && (
                          <span className="block text-xs text-espresso/50">{pincodeInfo.zoneLabel}</span>
                        )}
                      </span>
                      <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sage">
                      <span>Coupon ({appliedCoupon?.code})</span>
                      <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-sage">
                      <span>Points Redeemed</span>
                      <span>-₹{loyaltyDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-caramel/20 pt-2 font-semibold text-cocoa">
                    <span>Total</span><span className="text-caramel">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {!paymentConfig.demoMode && (
                <div className="mb-4 flex gap-2">
                  {['UPI', 'Card'].map((method) => (
                    <button key={method} type="button" className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-sm)] border-2 border-caramel bg-caramel/5 py-2.5 text-sm font-medium text-cocoa">
                      <CreditCard size={16} /> {method}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setCheckoutStep('delivery')} className="flex items-center gap-1">
                  <ChevronLeft size={16} /> Back
                </Button>
                <Button className="flex-1" magnetic onClick={handlePay} disabled={paying}>
                  {paying ? (
                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
                  ) : paymentConfig.demoMode ? (
                    <>Place Order — ₹{total.toLocaleString('en-IN')}</>
                  ) : (
                    <>Pay ₹{total.toLocaleString('en-IN')}</>
                  )}
                </Button>
              </div>
              {paymentConfig.demoMode && (
                <p className="mt-3 text-center text-xs text-espresso/50">
                  Demo checkout — your order will be saved and tracked normally.
                </p>
              )}
            </div>
          )}

          {checkoutStep === 'confirmation' && activeOrder && (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/20"
              >
                <Check size={32} className="text-sage" />
              </motion.div>
              <h3 className="mb-2 font-display text-2xl text-cocoa">Order Confirmed!</h3>
              <p className="mb-1 text-sm text-espresso/70">
                Thank you, {activeOrder.customerName}. Your order has been placed.
              </p>
              <p className="mb-4 font-mono text-sm font-semibold text-caramel">{activeOrder.id}</p>
              {activeOrder.pointsRedeemed > 0 && (
                <p className="mb-2 text-sm text-espresso/60">
                  {activeOrder.pointsRedeemed} loyalty points redeemed
                </p>
              )}
              <p className="mb-6 text-sm text-espresso/60">
                Order total: ₹{activeOrder.total.toLocaleString('en-IN')}
              </p>
              <Button className="w-full" magnetic onClick={() => setCheckoutStep('tracking')}>
                Track Your Order
              </Button>
            </div>
          )}

          {checkoutStep === 'tracking' && activeOrder && (
            <div>
              <OrderTracker
                orderId={activeOrder.id}
                statusIndex={trackingIndex}
                isComplete={trackingComplete}
              />
              {trackingComplete && (
                <p className="mt-4 text-center text-sm font-medium text-sage">
                  Your order has been delivered! Enjoy your treats.
                </p>
              )}
              <Button className="mt-6 w-full" variant="secondary" onClick={closeCheckout}>
                Close
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

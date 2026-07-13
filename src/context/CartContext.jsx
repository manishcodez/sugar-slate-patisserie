import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { ORDER_TRACKING_STAGES } from '../data/cakeBuilder'
import { useAuth } from './AuthContext'
import {
  fetchWishlistApi,
  addToWishlistApi,
  removeFromWishlistApi,
  readWishlistLocal,
  syncWishlistLocal,
  migrateLegacyWishlist,
} from '../services/api/wishlistApi'

import { attachProductImage, toStoredProduct } from '../utils/productImages'

const CartContext = createContext(null)
const CART_GUEST_KEY = 'ss-cart-guest'

function cartKey(userId) {
  return userId ? `ss-cart-${userId}` : CART_GUEST_KEY
}

function loadCart(userId) {
  try {
    const raw = localStorage.getItem(cartKey(userId))
    if (!raw) return []
    return JSON.parse(raw).map(attachProductImage)
  } catch {
    return []
  }
}

function saveCart(userId, items) {
  localStorage.setItem(cartKey(userId), JSON.stringify(items.map(toStoredProduct)))
}

const INITIAL_DELIVERY = {
  name: '',
  phone: '',
  email: '',
  address: '',
  pincode: '',
  city: 'Varanasi',
  deliveryType: 'delivery',
  instructions: '',
}

function generateOrderId() {
  return `SS-${Date.now().toString(36).toUpperCase().slice(-8)}`
}

export function CartProvider({ children }) {
  const { user, ready } = useAuth()
  const [items, setItems] = useState([])
  const [wishlist, setWishlist] = useState(new Set())
  const [isOpen, setIsOpen] = useState(false)
  const [cartPulse, setCartPulse] = useState(false)
  const [contactPrefill, setContactPrefill] = useState('')

  const [checkoutStep, setCheckoutStep] = useState(null)
  const [deliveryInfo, setDeliveryInfo] = useState(INITIAL_DELIVERY)
  const [activeOrder, setActiveOrder] = useState(null)
  const [trackingIndex, setTrackingIndex] = useState(0)
  const [trackingComplete, setTrackingComplete] = useState(false)

  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  useEffect(() => {
    if (!ready) return
    setItems(loadCart(user?.id))
  }, [user?.id, ready])

  useEffect(() => {
    if (!ready) return
    saveCart(user?.id, items)
  }, [items, user?.id, ready])

  useEffect(() => {
    if (!ready) return undefined
    let mounted = true
    ;(async () => {
      setWishlistLoading(true)
      if (user?.id) migrateLegacyWishlist(user.id)
      const res = await fetchWishlistApi(user?.id)
      if (mounted && res.ok) {
        const ids = Array.isArray(res.data) ? res.data : readWishlistLocal(user?.id)
        setWishlist(new Set(ids))
      } else if (mounted) {
        setWishlist(new Set())
      }
      if (mounted) setWishlistLoading(false)
    })()
    return () => { mounted = false }
  }, [user?.id, ready])

  const triggerPulse = useCallback(() => {
    setCartPulse(true)
    setTimeout(() => setCartPulse(false), 600)
  }, [])

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    triggerPulse()
  }, [triggerPulse])

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id, delta) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0),
    )
  }, [])

  const toggleWishlist = useCallback((id) => {
    if (!user?.id) return
    setWishlist((prev) => {
      const next = new Set(prev)
      const adding = !next.has(id)
      if (adding) next.add(id)
      else next.delete(id)

      const ids = [...next]
      syncWishlistLocal(ids, user.id)
      if (adding) addToWishlistApi(id, user.id)
      else removeFromWishlistApi(id, user.id)

      return next
    })
  }, [user?.id])

  const wishlistIds = useMemo(() => [...wishlist], [wishlist])

  const isWishlisted = useCallback((id) => wishlist.has(id), [wishlist])

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  )

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  )

  const buildContactMessage = useCallback(() => {
    if (!items.length) return ''
    const lines = items.map(
      (i) => `• ${i.name} × ${i.quantity} — ₹${(i.price * i.quantity).toLocaleString('en-IN')}`,
    )
    return `Hi, I'd like to place an order for the following items:\n\n${lines.join('\n')}\n\nEstimated Subtotal: ₹${subtotal.toLocaleString('en-IN')}\n\nPlease confirm availability and delivery details.`
  }, [items, subtotal])

  const startCheckout = useCallback(() => {
    if (!items.length) return
    setCheckoutStep('review')
    setIsOpen(false)
    setDeliveryInfo(INITIAL_DELIVERY)
    setAppliedCoupon(null)
    setTrackingIndex(0)
    setTrackingComplete(false)
  }, [items.length])

  const closeCheckout = useCallback(() => {
    setCheckoutStep(null)
  }, [])

  const completePayment = useCallback((total, extras = {}) => {
    const order = {
      id: extras.id || generateOrderId(),
      items: [...items],
      total,
      customerName: deliveryInfo.name,
      createdAt: new Date().toISOString(),
      ...extras,
    }
    setActiveOrder(order)
    setItems([])
    setCheckoutStep('confirmation')
    setTrackingIndex(0)
    setTrackingComplete(false)
  }, [items, deliveryInfo.name])

  const proceedToOrder = useCallback(() => {
    startCheckout()
  }, [startCheckout])

  useEffect(() => {
    if (trackingIndex >= ORDER_TRACKING_STAGES.length - 1 && checkoutStep === 'tracking') {
      const timer = setTimeout(() => setTrackingComplete(true), 4000)
      return () => clearTimeout(timer)
    }
  }, [trackingIndex, checkoutStep])

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      subtotal,
      itemCount,
      isOpen,
      setIsOpen,
      cartPulse,
      wishlist,
      wishlistIds,
      wishlistLoading,
      toggleWishlist,
      isWishlisted,
      contactPrefill,
      setContactPrefill,
      proceedToOrder,
      startCheckout,
      closeCheckout,
      checkoutStep,
      setCheckoutStep,
      deliveryInfo,
      setDeliveryInfo,
      activeOrder,
      completePayment,
      trackingIndex,
      setTrackingIndex,
      trackingComplete,
      setTrackingComplete,
      buildContactMessage,
      appliedCoupon,
      setAppliedCoupon,
    }),
    [
      items, addItem, removeItem, updateQuantity, subtotal, itemCount,
      isOpen, cartPulse, wishlist, wishlistIds, wishlistLoading, toggleWishlist, isWishlisted,
      contactPrefill, proceedToOrder, startCheckout, closeCheckout,
      checkoutStep, deliveryInfo, activeOrder, completePayment,
      trackingIndex, trackingComplete, buildContactMessage,
      appliedCoupon,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

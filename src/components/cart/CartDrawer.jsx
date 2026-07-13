import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useFocusTrap, useScrollLock } from '../../hooks/useFocusTrap'
import { fetchPaymentConfigApi } from '../../services/api/paymentsApi'
import { API_ENABLED } from '../../config/api'
import Button from '../ui/Button'

function AnimatedSubtotal({ value }) {
  const prev = useRef(value)

  useEffect(() => {
    prev.current = value
  }, [value])

  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="font-display text-2xl text-caramel"
    >
      ₹{value.toLocaleString('en-IN')}
    </motion.span>
  )
}

export default function CartDrawer() {
  const {
    items, isOpen, setIsOpen, removeItem, updateQuantity,
    subtotal, proceedToOrder,
  } = useCart()
  const trapRef = useFocusTrap(isOpen)
  useScrollLock(isOpen)
  const [demoMode, setDemoMode] = useState(true)

  useEffect(() => {
    if (!isOpen || !API_ENABLED) {
      setDemoMode(true)
      return
    }
    fetchPaymentConfigApi()
      .then((res) => setDemoMode(res.data?.demoMode !== false))
      .catch(() => setDemoMode(true))
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[110] bg-espresso/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
          <motion.aside
            ref={trapRef}
            className="fixed right-0 top-0 z-[115] flex h-full w-full max-w-md flex-col bg-cream shadow-warm-lg"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-blush px-6 py-5">
              <h2 className="font-display text-xl text-cocoa">Your Cart</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blush text-cocoa hover:bg-caramel hover:text-cream"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blush">
                    <ShoppingBag size={32} className="text-caramel/60" />
                  </div>
                  <p className="font-display text-lg text-cocoa">Your cart is empty</p>
                  <p className="mt-2 text-sm text-espresso/60">
                    Discover our handcrafted cakes and sweet treats.
                  </p>
                  <Button
                    href="#menu"
                    className="mt-6"
                    onClick={() => setIsOpen(false)}
                  >
                    Browse Menu
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-4 rounded-[var(--radius-md)] border border-blush bg-cream p-3"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 shrink-0 rounded-[var(--radius-sm)] object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-sm text-cocoa line-clamp-2">{item.name}</h3>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="shrink-0 text-espresso/40 hover:text-caramel"
                            aria-label={`Remove ${item.name}`}
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <p className="mt-1 text-sm font-medium text-caramel">
                          ₹{item.price.toLocaleString('en-IN')}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-blush text-cocoa hover:border-caramel"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-blush text-cocoa hover:border-caramel"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-blush px-6 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-espresso/70">Subtotal</span>
                  <AnimatedSubtotal value={subtotal} />
                </div>
                <Button className="w-full" magnetic onClick={proceedToOrder}>
                  Proceed to Checkout
                </Button>
                {demoMode && (
                  <p className="mt-2 text-center text-xs text-espresso/50">
                    Demo checkout — no real payment required
                  </p>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

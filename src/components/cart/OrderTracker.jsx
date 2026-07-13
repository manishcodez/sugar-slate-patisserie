import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Package, Flame, Truck, Gift } from 'lucide-react'
import { ORDER_TRACKING_STAGES } from '../../data/cakeBuilder'

const STAGE_ICONS = [Package, Flame, Check, Truck, Gift]

export default function OrderTracker({ orderId, statusIndex, isComplete }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-blush bg-cream/50 p-6">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-espresso/50">Order ID</p>
        <p className="font-mono text-lg font-bold text-cocoa">{orderId}</p>
      </div>

      <div className="relative">
        <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-blush" />
        <motion.div
          className="absolute left-5 top-2 w-0.5 bg-caramel origin-top"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: (statusIndex + (isComplete ? 1 : 0.5)) / ORDER_TRACKING_STAGES.length }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: 'calc(100% - 8px)' }}
        />

        <ul className="space-y-6">
          {ORDER_TRACKING_STAGES.map((stage, i) => {
            const Icon = STAGE_ICONS[i]
            const isActive = i <= statusIndex
            const isCurrent = i === statusIndex && !isComplete

            return (
              <li key={stage.id} className="relative flex items-start gap-4 pl-0">
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isActive
                      ? 'border-caramel bg-caramel text-cream'
                      : 'border-blush bg-cream text-espresso/30'
                  }`}
                >
                  {i < statusIndex || isComplete ? (
                    <Check size={18} />
                  ) : (
                    <Icon size={18} className={isCurrent ? 'animate-pulse' : ''} />
                  )}
                </div>
                <div className="pt-1.5">
                  <p className={`font-medium ${isActive ? 'text-cocoa' : 'text-espresso/40'}`}>
                    {stage.label}
                    {isCurrent && (
                      <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-caramel" />
                    )}
                  </p>
                  <p className={`text-sm ${isActive ? 'text-espresso/70' : 'text-espresso/40'}`}>
                    {stage.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export function useOrderTracking(statusIndex, isComplete, onAdvance) {
  useEffect(() => {
    if (isComplete || statusIndex >= ORDER_TRACKING_STAGES.length - 1) return

    const timer = setTimeout(() => {
      onAdvance()
    }, 4000)

    return () => clearTimeout(timer)
  }, [statusIndex, isComplete, onAdvance])
}

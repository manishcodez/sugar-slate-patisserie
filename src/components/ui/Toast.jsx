import { motion, AnimatePresence } from 'framer-motion'

export default function Toast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[300] max-w-[90vw] -translate-x-1/2 rounded-[var(--radius-md)] bg-espresso px-5 py-3.5 text-center text-sm font-medium text-cream shadow-warm-lg sm:max-w-md"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

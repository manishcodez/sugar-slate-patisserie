import { Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'

export default function CopyButton({ text, label }) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-caramel/10 text-caramel transition-colors hover:bg-caramel hover:text-cream"
      aria-label={label || 'Copy to clipboard'}
    >
      <motion.div
        key={copied ? 'check' : 'copy'}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </motion.div>
    </button>
  )
}

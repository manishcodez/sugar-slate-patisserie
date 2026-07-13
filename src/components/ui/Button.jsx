import { motion } from 'framer-motion'
import { useMagneticHover } from '../../hooks/useMagneticHover'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const variants = {
  primary:
    'bg-caramel text-cream hover:shadow-glow focus-visible:ring-2 focus-visible:ring-champagne',
  secondary:
    'bg-transparent border-2 border-caramel text-cocoa hover:bg-caramel/10 hover:border-champagne',
  tertiary:
    'bg-transparent text-caramel underline-offset-4 hover:underline hover:text-champagne px-0',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  magnetic = false,
  className = '',
  href,
  ...props
}) {
  const reduced = useReducedMotion()
  const magneticProps = useMagneticHover(0.25)
  const base =
    'inline-flex max-w-full touch-manipulation items-center justify-center gap-2 rounded-[var(--radius-sm)] font-semibold tracking-wide transition-colors duration-200 ease-[var(--ease-premium)] active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  if (reduced) {
    if (href) {
      return (
        <a href={href} className={classes} {...props}>
          {children}
        </a>
      )
    }
    return (
      <button type="button" className={classes} {...props}>
        {children}
      </button>
    )
  }

  const enableMagnetic = magnetic && !reduced
  const motionProps = enableMagnetic
    ? {
        ref: magneticProps.ref,
        onMouseMove: magneticProps.onMouseMove,
        onMouseLeave: magneticProps.onMouseLeave,
        whileTap: { scale: 0.98 },
        transition: { duration: 0.15 },
      }
    : {
        whileTap: { scale: 0.98 },
        transition: { duration: 0.15 },
      }

  if (href) {
    return (
      <motion.a href={href} className={classes} {...motionProps} {...props}>
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button className={classes} {...motionProps} {...props}>
      {children}
    </motion.button>
  )
}

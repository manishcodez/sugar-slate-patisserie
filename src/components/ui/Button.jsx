import { motion } from 'framer-motion'
import { useMagneticHover } from '../../hooks/useMagneticHover'

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
  const magneticProps = useMagneticHover(0.25)
  const base =
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-semibold tracking-wide transition-all duration-300 ease-[var(--ease-premium)] disabled:opacity-50 disabled:cursor-not-allowed'

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  const motionProps = magnetic
    ? {
        ref: magneticProps.ref,
        onMouseMove: magneticProps.onMouseMove,
        onMouseLeave: magneticProps.onMouseLeave,
        whileHover: { scale: 1.03 },
        whileTap: { scale: 0.97 },
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }
    : {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.97 },
        transition: { type: 'spring', stiffness: 300, damping: 20 },
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

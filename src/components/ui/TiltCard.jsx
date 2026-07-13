import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTiltEffect } from '../../hooks/useTiltEffect'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export default function TiltCard({ children, className = '' }) {
  const tilt = useTiltEffect(7)
  const reduced = useReducedMotion()
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  const enableTilt = !reduced && !isTouch

  return (
    <motion.div
      ref={enableTilt ? tilt.ref : undefined}
      onMouseMove={enableTilt ? tilt.onMouseMove : undefined}
      onMouseLeave={enableTilt ? tilt.onMouseLeave : undefined}
      whileTap={isTouch ? { scale: 0.98 } : undefined}
      className={`rounded-[var(--radius-md)] bg-cream transition-shadow duration-300 ${className}`}
      style={{ boxShadow: 'var(--shadow-warm)' }}
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

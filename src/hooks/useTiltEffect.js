import { useRef, useCallback } from 'react'
import { useReducedMotion } from './useReducedMotion'

export function useTiltEffect(maxTilt = 8) {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  const onMouseMove = useCallback(
    (e) => {
      if (reduced || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      const rotateX = -y * maxTilt
      const rotateY = x * maxTilt
      ref.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`
      ref.current.style.boxShadow = `${-x * 12}px ${y * 12}px 32px rgba(139, 74, 60, 0.18)`
    },
    [maxTilt, reduced],
  )

  const onMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'
    ref.current.style.boxShadow = 'var(--shadow-warm)'
  }, [])

  return { ref, onMouseMove, onMouseLeave }
}

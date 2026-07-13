import { useRef, useCallback } from 'react'
import { useReducedMotion } from './useReducedMotion'

export function useMagneticHover(strength = 0.35) {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  const onMouseMove = useCallback(
    (e) => {
      if (reduced || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      ref.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`
    },
    [strength, reduced],
  )

  const onMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = 'translate(0, 0)'
  }, [])

  return { ref, onMouseMove, onMouseLeave }
}

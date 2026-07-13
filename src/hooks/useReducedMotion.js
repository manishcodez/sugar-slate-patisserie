import { useState, useEffect } from 'react'

function shouldReduceMotion() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || window.matchMedia('(max-width: 767px)').matches
  )
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(shouldReduceMotion)

  useEffect(() => {
    const update = () => setReduced(shouldReduceMotion())
    update()
    window.addEventListener('resize', update, { passive: true })
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionMq.addEventListener('change', update)
    return () => {
      window.removeEventListener('resize', update)
      motionMq.removeEventListener('change', update)
    }
  }, [])

  return reduced
}

/** Only true when the user has enabled reduced motion in OS settings. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return reduced
}

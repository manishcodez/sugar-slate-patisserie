import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(active) {
  const containerRef = useRef(null)
  const previousFocus = useRef(null)

  useEffect(() => {
    if (!active) return

    previousFocus.current = document.activeElement

    const container = containerRef.current
    if (!container) return

    const focusables = () =>
      [...container.querySelectorAll(FOCUSABLE)].filter(
        (el) => !el.hasAttribute('disabled') && el.getClientRects().length > 0,
      )

    const timer = setTimeout(() => {
      const first = focusables()[0]
      first?.focus()
    }, 50)

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return
      const items = focusables()
      if (!items.length) return

      const first = items[0]
      const last = items[items.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(timer)
      container.removeEventListener('keydown', handleKeyDown)
      previousFocus.current?.focus?.()
    }
  }, [active])

  return containerRef
}

export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return

    const scrollY = window.scrollY
    const { style } = document.body
    const prev = {
      overflow: style.overflow,
      position: style.position,
      top: style.top,
      width: style.width,
    }

    style.overflow = 'hidden'
    style.position = 'fixed'
    style.top = `-${scrollY}px`
    style.width = '100%'

    return () => {
      style.overflow = prev.overflow
      style.position = prev.position
      style.top = prev.top
      style.width = prev.width
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}

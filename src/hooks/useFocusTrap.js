import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

let scrollLockCount = 0
let savedScrollY = 0
let savedBodyStyles = {}

function lockBodyScroll() {
  if (scrollLockCount === 0) {
    savedScrollY = window.scrollY
    const { style } = document.body
    savedBodyStyles = {
      overflow: style.overflow,
      position: style.position,
      top: style.top,
      width: style.width,
      paddingRight: style.paddingRight,
    }
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    style.overflow = 'hidden'
    style.position = 'fixed'
    style.top = `-${savedScrollY}px`
    style.width = '100%'
    if (scrollbarWidth > 0) {
      style.paddingRight = `${scrollbarWidth}px`
    }
  }
  scrollLockCount++
}

function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount !== 0) return

  const { style } = document.body
  style.overflow = savedBodyStyles.overflow || ''
  style.position = savedBodyStyles.position || ''
  style.top = savedBodyStyles.top || ''
  style.width = savedBodyStyles.width || ''
  style.paddingRight = savedBodyStyles.paddingRight || ''
  window.scrollTo(0, savedScrollY)
}

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
    lockBodyScroll()
    return () => unlockBodyScroll()
  }, [locked])
}

import { useState, useEffect, useRef } from 'react'

export function useInViewSection(sectionId, threshold = 0.15) {
  const [inView, setInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = document.getElementById(sectionId)
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [sectionId, threshold])

  return { inView, ref }
}

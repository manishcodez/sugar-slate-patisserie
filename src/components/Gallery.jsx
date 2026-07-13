import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { GALLERY_ITEMS, GALLERY_CATEGORIES } from '../data/gallery'
import { SectionHeading } from './ui/Animations'
import { useFocusTrap, useScrollLock } from '../hooks/useFocusTrap'

export default function Gallery() {
  const [category, setCategory] = useState('All')
  const [lightbox, setLightbox] = useState(null)
  const trapRef = useFocusTrap(!!lightbox)
  useScrollLock(!!lightbox)

  const filtered =
    category === 'All'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === category)

  const close = useCallback(() => setLightbox(null), [])

  const navigate = useCallback(
    (dir) => {
      setLightbox((current) => {
        if (!current) return null
        const idx = filtered.findIndex((item) => item.id === current.id)
        const newIndex = (idx + dir + filtered.length) % filtered.length
        return filtered[newIndex]
      })
    },
    [filtered],
  )

  useEffect(() => {
    if (!lightbox) return
    const handleKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') navigate(-1)
      if (e.key === 'ArrowRight') navigate(1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox, close, navigate])

  return (
    <section id="gallery" className="section-padding bg-section-alt">
      <div className="section-container">
        <SectionHeading
          eyebrow="Sweet Moments We've Created"
          title="Our Gallery"
          subtitle="A curated collection of celebration cakes and artisan desserts crafted for life's most memorable occasions."
        />

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                category === cat ? 'text-cream' : 'text-espresso/70 hover:text-caramel'
              }`}
            >
              {category === cat && (
                <motion.span
                  layoutId="gallery-pill"
                  className="absolute inset-0 rounded-full bg-caramel shadow-warm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {filtered.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className="group relative w-full overflow-hidden rounded-[var(--radius-md)] bg-blush/30 text-left shadow-warm transition-shadow hover:shadow-warm-lg"
              onClick={() => setLightbox(item)}
              aria-label={`View ${item.title}`}
            >
              <img
                src={item.image}
                alt={item.title}
                width={400}
                height={400}
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading={i < 8 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <div className="absolute inset-0 bg-espresso/0 transition-colors duration-300 group-hover:bg-espresso/15" />
              <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-cream/90 text-cocoa opacity-0 shadow-warm transition-opacity group-hover:opacity-100">
                <ZoomIn size={15} />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso/90 via-espresso/55 to-transparent px-3 py-3">
                <p className="text-xs font-medium text-cream sm:text-sm">{item.title}</p>
                <p className="text-[10px] text-cream/80 sm:text-xs">{item.category}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            ref={trapRef}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-espresso/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={`${lightbox.title} — image lightbox`}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-cream/20 text-cream transition-colors hover:bg-caramel"
              aria-label="Close lightbox"
            >
              <X size={22} />
            </button>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigate(-1) }}
              className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream/20 text-cream hover:bg-caramel"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>

            <motion.div
              className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-[var(--radius-lg)] shadow-luxury"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightbox.image}
                alt={lightbox.title}
                className="max-h-[85vh] w-full object-contain"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso/80 to-transparent p-5 text-center">
                <p className="font-display text-lg text-cream">{lightbox.title}</p>
                <p className="text-sm text-cream/70">{lightbox.category}</p>
              </div>
            </motion.div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigate(1) }}
              className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream/20 text-cream hover:bg-caramel"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

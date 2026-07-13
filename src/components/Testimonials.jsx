import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { useReviews } from '../context/ReviewsContext'
import { SectionHeading } from './ui/Animations'
import ReviewForm from './ReviewForm'

function StarRating({ rating }) {
  return (
    <div className="flex justify-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={18}
          className={i < rating ? 'fill-champagne text-champagne' : 'text-blush'}
        />
      ))}
    </div>
  )
}

export default function Testimonials() {
  const { allReviews } = useReviews()
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % allReviews.length)
    setProgress(0)
  }, [allReviews.length])

  const prev = () => {
    setCurrent((c) => (c - 1 + allReviews.length) % allReviews.length)
    setProgress(0)
  }

  useEffect(() => {
    if (paused || allReviews.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [paused, next, allReviews.length])

  useEffect(() => {
    if (paused || allReviews.length <= 1) return
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 2))
    }, 100)
    return () => clearInterval(interval)
  }, [paused, current, allReviews.length])

  useEffect(() => {
    if (current >= allReviews.length) setCurrent(0)
  }, [allReviews.length, current])

  const testimonial = allReviews[current]
  if (!testimonial) return null

  return (
    <section
      id="testimonials"
      className="section-padding bg-blush grain-overlay relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="section-container max-w-4xl">
        <SectionHeading
          eyebrow="Loved By Our Customers"
          title="What Our Clients Say"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-6 flex justify-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-caramel/10">
            <Quote size={32} className="text-champagne" aria-hidden="true" />
          </div>
        </motion.div>

        <div
          className="relative overflow-hidden rounded-[var(--radius-xl)] border border-blush/60 bg-cream p-8 shadow-luxury md:p-12"
          aria-live="polite"
        >
          {allReviews.length > 1 && !paused && (
            <motion.div
              className="absolute inset-x-0 top-0 h-0.5 bg-blush"
              aria-hidden="true"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-caramel to-champagne"
                style={{ width: `${progress}%` }}
              />
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <StarRating rating={testimonial.rating} />
              <blockquote className="mt-6 font-display text-xl leading-relaxed text-cocoa md:text-2xl lg:text-[1.65rem]">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              {testimonial.photo && (
                <img
                  src={testimonial.photo}
                  alt={`Photo from ${testimonial.name}`}
                  className="mx-auto mt-6 h-28 w-28 rounded-[var(--radius-md)] object-cover shadow-warm ring-2 ring-blush"
                  loading="lazy"
                />
              )}
              <div className="mt-8 inline-flex items-center gap-4 rounded-full bg-blush/50 px-6 py-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-caramel/15 font-display text-sm font-semibold text-cocoa ring-2 ring-champagne/30">
                  {testimonial.initials}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-espresso">{testimonial.name}</p>
                  <p className="text-sm text-espresso/60">
                    {testimonial.context}
                    {testimonial.isUserSubmitted && ' · Verified Customer'}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {allReviews.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-cocoa shadow-warm transition-all hover:bg-caramel hover:text-cream md:left-4"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-cocoa shadow-warm transition-all hover:bg-caramel hover:text-cream md:right-4"
                aria-label="Next testimonial"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {allReviews.length > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {allReviews.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setCurrent(i); setProgress(0) }}
                className="p-1"
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={i === current ? 'true' : undefined}
              >
                <motion.span
                  className="block h-2.5 rounded-full bg-caramel"
                  animate={{
                    width: i === current ? 28 : 10,
                    opacity: i === current ? 1 : 0.3,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              </button>
            ))}
          </div>
        )}

        <ReviewForm />
      </div>
    </section>
  )
}

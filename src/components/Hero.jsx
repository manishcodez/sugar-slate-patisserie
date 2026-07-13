import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { BAKERY } from '../data/constants'
import { HERO_SLIDES } from '../data/heroSlides'
import Button from './ui/Button'
import { useReducedMotion } from '../hooks/useReducedMotion'

const SLIDE_INTERVAL_MS = 5000

const headline = 'Cakes Crafted with Love, Designed to Impress'
const words = headline.split(' ')

function FloatingParticle({ delay, x, y, size }) {
  return (
    <motion.div
      className="absolute rounded-full bg-champagne/30 blur-sm"
      style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
      animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

export default function Hero() {
  const reduced = useReducedMotion()
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    if (reduced) return
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [reduced])

  const currentSlide = HERO_SLIDES[activeSlide]

  return (
    <section
      id="home"
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden pb-24 sm:pb-20"
    >
      <div className="absolute inset-0">
        <AnimatePresence mode="sync" initial={false}>
          <motion.img
            key={currentSlide.src}
            src={currentSlide.src}
            alt={currentSlide.alt}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: 1 }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.8, ease: 'easeInOut' },
            }}
            fetchPriority={activeSlide === 0 ? 'high' : 'low'}
          />
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-espresso/85 via-espresso/65 to-espresso/90" />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(212,100,138,0.15) 0%, transparent 60%), radial-gradient(ellipse 80% 70% at 50% 45%, rgba(43,27,20,0.7) 0%, rgba(43,27,20,0.5) 45%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      {!reduced && (
        <>
          <FloatingParticle delay={0} x={15} y={20} size={12} />
          <FloatingParticle delay={2} x={75} y={35} size={8} />
        </>
      )}

      <motion.div
        className="absolute right-4 top-20 z-10 hidden text-right md:block md:right-8 lg:top-24"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <p className="text-xs font-medium text-champagne">{BAKERY.name}</p>
        <p className="mt-1 text-xs text-cream/70">{BAKERY.hours}</p>
        {BAKERY.phone ? (
          <a
            href={`tel:${BAKERY.phone.replace(/\s/g, '')}`}
            className="mt-2 block text-sm font-medium text-cream/90 transition-colors hover:text-champagne"
          >
            {BAKERY.phone}
          </a>
        ) : (
          <a
            href={`mailto:${BAKERY.email}`}
            className="mt-2 block text-sm font-medium text-cream/90 transition-colors hover:text-champagne"
          >
            {BAKERY.email}
          </a>
        )}
      </motion.div>

      <motion.div
        className="section-container relative z-10 min-w-0 px-4 py-20 text-center sm:px-5 sm:py-24 md:px-8 md:py-28 lg:py-32"
      >
        <motion.p
          className="script-accent mb-2 text-xl text-champagne sm:text-2xl md:text-3xl"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Sugar & Slate Patisserie
        </motion.p>

        <motion.p
          className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Handcrafted Since Day One
        </motion.p>

        <h1
          className="hero-headline mx-auto max-w-4xl text-pretty !text-cream"
          style={{ textShadow: '0 2px 24px rgba(0,0,0,0.7), 0 4px 40px rgba(0,0,0,0.5)' }}
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.3em]"
              initial={reduced ? false : { opacity: 0, y: 30, filter: 'blur(8px)' }}
              animate={reduced ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={reduced ? undefined : {
                delay: 0.5 + i * 0.08,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed !text-cream sm:mt-6 sm:text-base md:text-lg lg:text-xl"
          style={{ textShadow: '0 2px 16px rgba(0,0,0,0.65)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          From saffron-kissed sponges and gulab jamun layers to French entremets —
          we craft premium cakes and mithai-inspired desserts that honour Indian
          tradition with world-class patisserie artistry.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          {['Fresh Daily', 'Custom Cakes', 'Varanasi Studio'].map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-cream/25 bg-cream/15 px-4 py-1.5 text-xs font-medium tracking-wide text-cream/90"
            >
              {badge}
            </span>
          ))}
        </motion.div>

        <motion.div
          className="mt-6 flex w-full flex-col items-stretch justify-center gap-2.5 sm:mt-8 sm:max-w-md sm:gap-3 md:mt-10 md:max-w-none md:flex-row md:items-center md:gap-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.6 }}
        >
          <Button href="#custom-cakes" magnetic size="md" className="w-full md:w-auto lg:!px-8 lg:!py-4 lg:!text-lg">
            Order Custom Cake
          </Button>
          <Button href="#menu" variant="secondary" size="md" className="w-full !border-cream !text-cream hover:!bg-cream/20 hover:!text-cream md:w-auto lg:!px-8 lg:!py-4 lg:!text-lg">
            Explore Menu
          </Button>
        </motion.div>
      </motion.div>

      <div
        className="absolute bottom-32 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-24 md:bottom-20"
        role="tablist"
        aria-label="Hero cake gallery"
      >
        {HERO_SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            aria-selected={i === activeSlide}
            aria-label={`Show ${slide.label}`}
            onClick={() => setActiveSlide(i)}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === activeSlide
                ? 'w-8 bg-champagne'
                : 'w-2 bg-cream/40 hover:bg-cream/70'
            }`}
          />
        ))}
      </div>

      <motion.a
        href="#about"
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 text-cream/70 md:block"
        animate={reduced ? undefined : { y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
        transition={reduced ? undefined : { duration: 2, repeat: Infinity }}
        aria-label="Scroll to about section"
      >
        <ChevronDown size={28} />
      </motion.a>
    </section>
  )
}

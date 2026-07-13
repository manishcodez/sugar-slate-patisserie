import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Sparkles, ArrowRight, MapPin } from 'lucide-react'
import { BAKERY } from '../data/constants'
import { HERO_SLIDES } from '../data/heroSlides'
import Button from './ui/Button'
import { useReducedMotion, usePrefersReducedMotion } from '../hooks/useReducedMotion'

const SLIDE_INTERVAL_MS = 6000

const HERO_STATS = [
  { value: '3000+', label: 'Cakes Crafted' },
  { value: '4+', label: 'Years of Art' },
  { value: '98%', label: 'Happy Clients' },
]

const THUMB_SLIDES = HERO_SLIDES.slice(0, 8)
const DESKTOP_THUMBS = HERO_SLIDES.slice(0, 6)

export default function Hero() {
  const reduced = useReducedMotion()
  const prefersReduced = usePrefersReducedMotion()
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    if (prefersReduced) return
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [prefersReduced])

  const currentSlide = HERO_SLIDES[activeSlide]

  return (
    <section
      id="home"
      className="hero-section relative flex min-h-[100dvh] flex-col overflow-hidden"
    >
      {/* Background slideshow */}
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
              scale: prefersReduced ? 1 : reduced ? 1.04 : 1.08,
            }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1, ease: 'easeInOut' },
              scale: prefersReduced || reduced
                ? { duration: 0 }
                : { duration: SLIDE_INTERVAL_MS / 1000, ease: 'linear' },
            }}
            fetchPriority={activeSlide === 0 ? 'high' : 'low'}
          />
        </AnimatePresence>
      </div>

      {/* Layered overlays — lighter so cakes stay visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-espresso/75 via-espresso/35 to-espresso/20 lg:from-espresso/80 lg:via-espresso/45 lg:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-transparent to-espresso/30" />
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 75% 50%, rgba(240,168,192,0.18) 0%, transparent 65%)',
        }}
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="section-container relative z-10 mx-auto flex min-h-[100dvh] w-full min-w-0 flex-1 flex-col justify-center px-0 pb-28 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:px-5 md:px-8 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center lg:gap-6 lg:px-8 lg:pb-20 lg:pt-[5.5rem] xl:gap-8 xl:pt-24">
        {/* Left — content panel */}
        <motion.div
          className="hero-glass hero-glass-mobile-full mx-auto w-full lg:mx-0 lg:max-w-none lg:rounded-[var(--radius-xl)]"
          initial={reduced ? false : { opacity: 0, y: 28 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-glass-inner px-5 py-6 sm:p-7 md:p-8 lg:p-6 xl:p-8">
            <div className="hero-ornament mb-4" aria-hidden="true">
              <span className="hero-ornament-line" />
              <span className="eyebrow !text-champagne/90">Premium Patisserie · Varanasi</span>
              <span className="hero-ornament-line" />
            </div>

            <p className="script-accent mb-2 text-2xl text-champagne sm:text-3xl md:text-4xl">
              Sugar & Slate
            </p>

            <h1 className="hero-headline mb-3 text-pretty !text-cream sm:mb-4">
              Cakes Crafted with{' '}
              <span className="text-champagne">Love</span>, Designed to{' '}
              <span className="text-champagne">Impress</span>
            </h1>

            <p className="mb-5 max-w-lg text-sm leading-relaxed text-cream/85 sm:text-base md:text-lg">
              Indian celebration meets French artistry — saffron sponges, gulab jamun
              layers, and handcrafted entremets made fresh in our Varanasi studio.
            </p>

            {/* Stats */}
            <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="hero-stat text-center">
                  <p className="font-display text-lg font-bold text-champagne sm:text-xl md:text-2xl">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-cream/65 sm:text-[10px]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
              <Button
                href="#custom-cakes"
                size="md"
                className="hero-cta-primary w-full gap-2 sm:w-auto lg:!px-7 lg:!py-3.5"
              >
                <Sparkles size={16} />
                Order Custom Cake
              </Button>
              <Button
                href="#menu"
                variant="secondary"
                size="md"
                className="hero-cta-secondary w-full gap-2 !border-champagne/60 !text-cream hover:!bg-cream/15 sm:w-auto lg:!px-7 lg:!py-3.5"
              >
                Explore Menu
                <ArrowRight size={16} />
              </Button>
            </div>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-cream/60 sm:justify-start sm:text-xs">
              <MapPin size={12} className="shrink-0 text-champagne" />
              Mirzamurad, Varanasi · {BAKERY.hours}
            </p>
          </div>
        </motion.div>

        {/* Right — desktop showcase */}
        <motion.div
          className="hero-showcase-column relative hidden min-w-0 lg:block"
          initial={reduced ? false : { opacity: 0, x: 32 }}
          animate={reduced ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-showcase-frame">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide.src}
                src={currentSlide.src}
                alt={currentSlide.alt}
                className="hero-showcase-img"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>
            <div className="hero-showcase-badge">
              <Sparkles size={12} />
              <span>Signature Creation</span>
            </div>
          </div>
          <p className="mt-3 text-center font-display text-sm text-cream/90 xl:text-base">
            {currentSlide.label}
          </p>

          {/* Desktop thumbnails */}
          <div className="mt-3 flex flex-wrap justify-center gap-1.5 xl:mt-4 xl:gap-2">
            {DESKTOP_THUMBS.map((slide) => {
              const slideIndex = HERO_SLIDES.indexOf(slide)
              const isActive = slideIndex === activeSlide
              return (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => setActiveSlide(slideIndex)}
                  aria-label={`Show ${slide.label}`}
                  className={`hero-thumb ${isActive ? 'hero-thumb-active' : ''}`}
                >
                  <img src={slide.src} alt="" className="h-full w-full object-cover" />
                </button>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Mobile thumbnail strip */}
      <div className="absolute bottom-20 left-0 right-0 z-10 px-0 lg:hidden">
        <div className="hero-thumb-scroll mx-auto flex w-full gap-2 overflow-x-auto px-4 pb-1 sm:max-w-md sm:px-5">
          {THUMB_SLIDES.map((slide) => {
            const slideIndex = HERO_SLIDES.indexOf(slide)
            const isActive = slideIndex === activeSlide
            return (
              <button
                key={slide.src}
                type="button"
                onClick={() => setActiveSlide(slideIndex)}
                aria-label={`Show ${slide.label}`}
                className={`hero-thumb hero-thumb-mobile shrink-0 ${isActive ? 'hero-thumb-active' : ''}`}
              >
                <img src={slide.src} alt="" className="h-full w-full object-cover" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Scroll hint — desktop */}
      <motion.a
        href="#about"
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-cream/50 md:flex"
        animate={reduced ? undefined : { y: [0, 6, 0] }}
        transition={reduced ? undefined : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        aria-label="Scroll to about section"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Discover</span>
        <ChevronDown size={22} />
      </motion.a>
    </section>
  )
}

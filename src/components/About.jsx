import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { IMAGES } from '../data/images'
import { FOUNDER } from '../data/constants'
import { SectionHeading, CurtainReveal, ScrollReveal, StaggerChildren, StaggerItem } from './ui/Animations'

const STATS = [
  { value: 4, suffix: '+', label: 'Years of Craft', icon: '✦' },
  { value: 3000, suffix: '+', label: 'Cakes Delivered', icon: '✦' },
  { value: 98, suffix: '%', label: 'Happy Clients', icon: '✦' },
  { value: 100, suffix: '%', label: 'Fresh, Never Frozen', icon: '✦' },
]

const TIMELINE = [
  { year: '2022', title: 'Studio Opens in Varanasi', desc: 'Mirzamurad studio — French technique meets Indian celebration culture.' },
  { year: '2023', title: 'Mithai Fusion Collection', desc: 'Gulab jamun cheesecakes, saffron sponges & festive hampers launched.' },
  { year: '2024', title: 'Wedding & Corporate Orders', desc: '500+ celebration cakes for weddings, corporates & intimate gatherings.' },
  { year: '2026', title: 'Premium Patisserie Brand', desc: 'Varanasi\'s destination for custom cakes, designer desserts & artisan mithai.' },
]

const ABOUT_PHOTOS = [
  { src: IMAGES.about1, alt: 'Taj Mahal, Agra', label: 'Taj Mahal' },
  { src: IMAGES.about2, alt: 'India Gate, New Delhi', label: 'India Gate' },
  { src: IMAGES.about3, alt: 'Kashi Vishwanath Temple, Varanasi', label: 'Kashi Vishwanath' },
  { src: IMAGES.about4, alt: 'Varanasi Ghats on the Ganges at sunset', label: 'Varanasi Ghats' },
]

function AnimatedCounter({ value, suffix }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2000
    const step = value / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <span ref={ref} className="font-display text-3xl font-semibold text-caramel md:text-4xl">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export default function About() {
  return (
    <section id="about" className="section-padding bg-premium-pink grain-overlay relative overflow-hidden">
      <div className="section-container">
        <SectionHeading eyebrow="Our Story" title="Where Passion Meets Pastry" />

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal direction="left">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {ABOUT_PHOTOS.map((photo, i) => (
                <CurtainReveal key={photo.alt} delay={i * 0.1} className="group overflow-hidden rounded-[var(--radius-md)] shadow-warm">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-transparent opacity-80" />
                    <div className="absolute inset-x-0 bottom-0 px-3 py-3">
                      <p className="text-xs font-semibold tracking-wider text-cream md:text-sm">{photo.label}</p>
                    </div>
                  </div>
                </CurtainReveal>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.1}>
            <div className="space-y-5 text-espresso/85">
              <p className="text-lg leading-relaxed">
                Sugar & Slate Patisserie was born from a simple belief: that every
                celebration deserves a centerpiece as extraordinary as the moment
                itself. Founded by <strong className="text-cocoa">{FOUNDER.name}</strong> in our
                Mirzamurad studio in Varanasi, our patisserie has grown into a destination
                for discerning clients who seek the perfect union of Indian celebration
                culture and refined French technique.
              </p>
              <p>
                {FOUNDER.bio}
              </p>
            </div>

            <StaggerChildren className="mt-10 grid grid-cols-2 gap-4">
              {STATS.map((stat) => (
                <StaggerItem key={stat.label}>
                  <div className="premium-card p-5 text-center">
                    <Sparkles size={16} className="mx-auto mb-2 text-champagne" />
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    <p className="mt-2 text-xs font-medium uppercase tracking-wider text-espresso/60">{stat.label}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </ScrollReveal>
        </div>

        <ScrollReveal className="mt-20">
          <div className="luxury-divider mb-12" />
          <h3 className="mb-10 text-center font-display text-2xl text-cocoa md:text-3xl">Our Journey</h3>
          <div className="relative mx-auto max-w-3xl">
            <div className="absolute left-4 top-0 hidden h-full w-px bg-gradient-to-b from-champagne via-caramel to-transparent md:left-1/2 md:block" />
            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.year}
                  className={`relative flex flex-col gap-4 md:flex-row md:items-center ${
                    i % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div className="hidden w-1/2 md:block" />
                  <div className={`w-full md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className="premium-card p-5 md:p-6">
                      <p className="text-sm font-semibold text-caramel">{item.year}</p>
                      <h4 className="mt-1 font-display text-lg text-cocoa">{item.title}</h4>
                      <p className="mt-2 text-sm text-espresso/70">{item.desc}</p>
                    </div>
                  </div>
                  <span className="absolute left-4 top-6 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-cream bg-caramel md:left-1/2 md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

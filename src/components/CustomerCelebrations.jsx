import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, MessageCircle } from 'lucide-react'
import {
  CELEBRATION_CATEGORIES,
  CELEBRATION_ITEMS,
} from '../data/customerCelebrations'
import Button from './ui/Button'

function CelebrationCard({ item, index }) {
  return (
    <article
      className="group relative overflow-hidden rounded-[var(--radius-md)] bg-cream shadow-warm transition-shadow duration-300 hover:shadow-warm-lg"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-square">
        <img
          src={item.image}
          alt={item.caption}
          loading={index < 6 ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-105"
        />

        <span className="absolute left-3 top-3 rounded-full bg-espresso/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-champagne">
          {item.category}
        </span>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso/90 via-espresso/55 to-transparent px-4 py-4 pt-10">
          <p className="text-sm leading-snug text-cream">{item.caption}</p>
        </div>
      </div>
    </article>
  )
}

export default function CustomerCelebrations() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered =
    activeCategory === 'All'
      ? CELEBRATION_ITEMS
      : CELEBRATION_ITEMS.filter((item) => item.category === activeCategory)

  return (
    <section
      id="customer-celebrations"
      className="section-padding bg-gradient-to-b from-blush via-cream to-blush/60"
    >
      <div className="section-container">
        <div className="mb-12 text-center md:mb-16">
          <motion.p
            className="eyebrow mb-3 text-caramel"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Celebrations We&apos;ve Been Part Of
          </motion.p>

          <motion.div
            className="relative inline-flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Flame
              size={22}
              className="hidden text-champagne sm:block"
              aria-hidden="true"
            />
            <h2 className="font-display text-cocoa">Customer Celebrations</h2>
            <Flame
              size={22}
              className="hidden text-champagne sm:block"
              aria-hidden="true"
            />
          </motion.div>

          <motion.p
            className="mx-auto mt-4 max-w-xl text-espresso/70"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Real moments, real smiles
          </motion.p>
        </div>

        <div
          className="mb-10 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Filter celebration photos by occasion"
        >
          {CELEBRATION_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                  isActive
                    ? 'bg-cocoa text-cream shadow-warm'
                    : 'bg-cream/80 text-espresso/70 hover:bg-champagne/30 hover:text-cocoa'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {filtered.map((item, i) => (
            <CelebrationCard key={item.id} item={item} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-espresso/60">
            No celebrations in this category yet — yours could be the first!
          </p>
        )}

        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-6 text-sm text-espresso/60">
            Celebrated with us? We&apos;d love to feature your story.
          </p>
          <Button href="#contact" size="lg" magnetic className="gap-2">
            <MessageCircle size={18} />
            Share Your Celebration With Us
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

import { motion } from 'framer-motion'
import { SHOP_CATEGORIES } from '../data/shopCategories'
import { useShop } from '../context/ShopContext'
import { ScrollReveal, SectionHeading } from './ui/Animations'

export default function CategoryGrid() {
  const { setMenuFilter, setSearchQuery } = useShop()

  const handleClick = (cat) => {
    if (cat.scrollTo) {
      document.querySelector(cat.scrollTo)?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    setMenuFilter(cat.filter)
    if (cat.searchHint) setSearchQuery(cat.searchHint)
    else setSearchQuery('')
    setTimeout(() => {
      document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <section id="shop-categories" className="section-padding bg-blush">
      <div className="section-container">
        <SectionHeading
          eyebrow="Explore Our Collection"
          title="Shop by Category"
          subtitle="From classic celebration cakes to curated gift hampers — find the perfect treat for every occasion."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOP_CATEGORIES.map((cat, i) => (
            <ScrollReveal key={cat.id} delay={i * 0.06}>
              <motion.button
                type="button"
                onClick={() => handleClick(cat)}
                className="group relative w-full overflow-hidden rounded-[var(--radius-lg)] border-2 border-transparent text-left transition-all duration-300 hover:border-champagne hover:shadow-warm-lg"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-xl text-cream">{cat.name}</h3>
                  <p className="mt-1 text-sm text-cream/70">{cat.description}</p>
                </div>
              </motion.button>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

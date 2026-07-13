import { memo } from 'react'
import { motion } from 'framer-motion'
import { Star, Plus } from 'lucide-react'
import { BESTSELLERS, formatReviews } from '../data/menuItems'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'
import { ScrollReveal } from './ui/Animations'

function CompactCard({ product }) {
  const { addItem } = useCart()

  return (
    <motion.div
      className="group w-[200px] shrink-0 snap-start sm:w-[230px]"
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-blush/50 bg-cream shadow-warm transition-shadow duration-500 group-hover:shadow-warm-lg">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full object-cover transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-110"
            loading="lazy"
          />
          {product.badge && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-cream/95 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cocoa">
              {product.badge}
            </span>
          )}
          <button
            type="button"
            onClick={() => addItem(product)}
            className="absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-caramel text-cream shadow-warm transition-transform hover:scale-110"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-display text-sm text-cocoa line-clamp-1">{product.name}</h3>
          <div className="mt-1.5 flex items-center gap-1 text-xs">
            <Star size={11} className="fill-champagne text-champagne" />
            <span className="font-medium text-cocoa">{product.rating}</span>
            <span className="text-espresso/40">{formatReviews(product.reviewCount)}</span>
          </div>
          <p className="mt-2 font-display text-base font-semibold text-caramel">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

const MemoCompactCard = memo(CompactCard)

export default function BestsellerStrip() {
  const { bestsellers } = useProducts()
  const items = bestsellers.length > 0 ? bestsellers : BESTSELLERS

  return (
    <section id="bestsellers" className="section-padding bg-cream py-12 md:py-16">
      <div className="section-container">
        <ScrollReveal>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-2">Trending This Week</p>
              <h2 className="font-display text-2xl text-cocoa md:text-3xl">Best Sellers</h2>
            </div>
            <a
              href="#menu"
              className="hidden items-center gap-1 text-sm font-medium text-caramel transition-colors hover:text-champagne sm:flex"
            >
              View All <span aria-hidden="true">→</span>
            </a>
          </div>
        </ScrollReveal>

        <motion.div
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {items.map((product) => (
            <MemoCompactCard key={product.id} product={product} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

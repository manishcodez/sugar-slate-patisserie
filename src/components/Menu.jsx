import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { filterAndSortProducts } from '../data/menuItems'
import { FILTER_TABS } from '../data/shopCategories'
import { useShop } from '../context/ShopContext'
import { useProducts } from '../context/ProductsContext'
import { SectionHeading } from './ui/Animations'
import ProductCard from './menu/ProductCard'
import SearchBar from './menu/SearchBar'
import SortDropdown from './menu/SortDropdown'
import Button from './ui/Button'

export default function Menu() {
  const { products } = useProducts()
  const { menuFilter, setMenuFilter, searchQuery, setSearchQuery, sortBy, setSortBy } = useShop()

  useEffect(() => {
    const handler = () => {
      if (window.location.hash === '#menu') {
        document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })
      }
    }
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  const filtered = useMemo(
    () => filterAndSortProducts(products, {
      category: menuFilter,
      search: searchQuery,
      sortBy,
    }),
    [products, menuFilter, searchQuery, sortBy],
  )

  return (
    <section id="menu" className="section-padding bg-section-alt">
      <div className="section-container">
        <SectionHeading
          eyebrow="Our Signature Collection"
          title="Menu & Bestsellers"
          subtitle="30 handcrafted creations — from Indian mithai fusion cakes to French patisserie classics, all made fresh to order."
        />

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-2 rounded-[var(--radius-lg)] bg-cream/60 p-3 md:gap-3 md:p-4">
          {FILTER_TABS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setMenuFilter(cat)}
              className={`relative rounded-full px-4 py-2.5 text-sm font-medium transition-colors md:px-5 ${
                menuFilter === cat
                  ? 'text-cream'
                  : 'text-espresso/70 hover:text-caramel'
              }`}
            >
              {menuFilter === cat && (
                <motion.span
                  layoutId="menu-pill"
                  className="absolute inset-0 rounded-full bg-caramel"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display text-xl text-cocoa">No products found</p>
            <p className="mt-2 text-espresso/60">Try adjusting your search or filter.</p>
            <button
              type="button"
              onClick={() => { setMenuFilter('All'); setSearchQuery('') }}
              className="mt-4 text-sm font-medium text-caramel hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <ProductCard key={item.id} product={item} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="mt-8 text-center">
          <Button href="#contact" variant="secondary">
            Need Something Custom?
          </Button>
        </div>
      </div>
    </section>
  )
}

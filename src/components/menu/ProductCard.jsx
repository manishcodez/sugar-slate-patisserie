import { memo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Check, Star } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { formatReviews, getDiscountPercent } from '../../data/menuItems'
import TiltCard from '../ui/TiltCard'

function ProductCard({ product, index = 0 }) {
  const { addItem, toggleWishlist, isWishlisted } = useCart()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [added, setAdded] = useState(false)
  const wishlisted = isWishlisted(product.id)
  const discount = getDiscountPercent(product.price, product.originalPrice)

  const handleWishlist = useCallback(() => {
    if (!user) {
      showNotification('Sign in to save items to your wishlist', 3500)
      return
    }
    toggleWishlist(product.id)
  }, [user, toggleWishlist, product.id, showNotification])

  const handleAdd = useCallback(() => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }, [addItem, product])

  return (
    <div>
      <TiltCard className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-blush/50 bg-cream shadow-warm transition-shadow duration-500 hover:shadow-warm-lg">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {product.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cocoa shadow-warm">
              {product.badge}
            </span>
          )}

          {discount > 0 && (
            <span className="absolute left-3 top-11 rounded-full bg-caramel px-2.5 py-0.5 text-[10px] font-bold text-cream shadow-glow">
              −{discount}%
            </span>
          )}

          <button
            type="button"
            onClick={handleWishlist}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/95 shadow-warm transition-all hover:scale-110"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={16} className={wishlisted ? 'fill-caramel text-caramel' : 'text-cocoa/50'} />
          </button>

          <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-espresso/85 to-transparent p-4 translate-y-0 md:translate-y-full md:transition-transform md:duration-500 md:group-hover:translate-y-0">
            <motion.button
              type="button"
              onClick={handleAdd}
              className="flex items-center gap-2 rounded-full bg-cream px-6 py-2.5 text-sm font-semibold text-cocoa shadow-warm"
              whileTap={{ scale: 0.95 }}
              animate={added ? { scale: [1, 1.08, 1] } : {}}
            >
              {added ? <><Check size={14} /> Added!</> : <><ShoppingBag size={14} /> Add to Cart</>}
            </motion.button>
          </div>
        </div>

        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-caramel/80">{product.category}</p>
          <h3 className="mt-1 font-display text-lg text-cocoa line-clamp-1">{product.name}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-espresso/65 line-clamp-2">{product.description}</p>

          <div className="mt-3 flex items-center gap-1.5">
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={i < Math.floor(product.rating) ? 'fill-champagne text-champagne' : 'text-blush'}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-cocoa">{product.rating}</span>
            <span className="text-xs text-espresso/45">{formatReviews(product.reviewCount)}</span>
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-blush/60 pt-4">
            <div>
              <span className="font-display text-xl font-semibold text-caramel">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span className="ml-2 text-sm text-espresso/40 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-caramel/10 text-caramel transition-colors hover:bg-caramel hover:text-cream md:hidden"
              aria-label="Add to cart"
            >
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      </TiltCard>
    </div>
  )
}

export default memo(ProductCard)

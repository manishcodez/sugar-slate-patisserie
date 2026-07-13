import { Heart, Loader2, ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useProducts } from '../../context/ProductsContext'
import Button from '../ui/Button'

export default function WishlistPage() {
  const { wishlistIds, wishlistLoading, toggleWishlist, addItem } = useCart()
  const { products } = useProducts()

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id))

  if (wishlistLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-espresso/60">
        <Loader2 size={24} className="animate-spin" />
      </div>
    )
  }

  if (!wishlistProducts.length) {
    return (
      <div className="py-12 text-center">
        <Heart size={40} className="mx-auto mb-3 text-blush" />
        <p className="text-sm text-espresso/70">Your wishlist is empty.</p>
        <Button href="#menu" variant="secondary" className="mt-4">Explore Menu</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg text-cocoa">My Wishlist</h3>
      <ul className="space-y-3">
        {wishlistProducts.map((product) => (
          <li key={product.id} className="flex gap-3 rounded-[var(--radius-md)] border border-blush p-3">
            <img src={product.image} alt={product.name} className="h-16 w-16 rounded object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-cocoa line-clamp-1">{product.name}</p>
              <p className="text-sm text-caramel">₹{product.price.toLocaleString('en-IN')}</p>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  className="!px-3 !py-1.5 text-xs"
                  onClick={() => addItem(product)}
                >
                  <ShoppingBag size={14} className="mr-1 inline" /> Add to Cart
                </Button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="text-xs text-red-700 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

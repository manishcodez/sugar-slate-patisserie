import { LayoutDashboard, ShoppingBag, Heart, Bell, MapPin, Package } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../context/OrdersContext'
import { useNotification } from '../../context/NotificationContext'
import { useCart } from '../../context/CartContext'

export default function CustomerDashboard({ onNavigate }) {
  const { user } = useAuth()
  const { orders } = useOrders()
  const { unreadCount } = useNotification()
  const { wishlistIds } = useCart()

  const stats = [
    { label: 'Orders', value: orders.length, icon: ShoppingBag, tab: 'orders' },
    { label: 'Wishlist', value: wishlistIds.length, icon: Heart, tab: 'wishlist' },
    { label: 'Notifications', value: unreadCount, icon: Bell, tab: 'notifications' },
  ]

  const quickLinks = [
    { label: 'Track an Order', icon: Package, tab: 'tracking' },
    { label: 'Delivery Addresses', icon: MapPin, tab: 'addresses' },
    { label: 'My Profile', icon: LayoutDashboard, tab: 'profile' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-espresso/60">Welcome back,</p>
        <h3 className="font-display text-2xl text-cocoa">{user?.name}</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, tab }) => (
          <button
            key={tab}
            type="button"
            onClick={() => onNavigate(tab)}
            className="rounded-[var(--radius-md)] border border-blush bg-cream p-4 text-left transition-colors hover:border-caramel"
          >
            <Icon size={20} className="mb-2 text-caramel" />
            <p className="font-display text-2xl text-cocoa">{value}</p>
            <p className="text-xs text-espresso/60">{label}</p>
          </button>
        ))}
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-espresso/50">Quick Links</h4>
        <div className="space-y-2">
          {quickLinks.map(({ label, icon: Icon, tab }) => (
            <button
              key={tab}
              type="button"
              onClick={() => onNavigate(tab)}
              className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] border border-blush px-4 py-3 text-left text-sm text-cocoa transition-colors hover:bg-blush/40"
            >
              <Icon size={18} className="text-caramel" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

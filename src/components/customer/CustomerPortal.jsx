import { useState } from 'react'
import {
  LayoutDashboard, User, ShoppingBag, Heart, Bell, MapPin, Package,
} from 'lucide-react'
import Modal from '../ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { useCustomerPortal } from '../../context/CustomerPortalContext'
import Button from '../ui/Button'
import CustomerDashboard from './CustomerDashboard'
import CustomerProfile from './CustomerProfile'
import OrderHistory from './OrderHistory'
import WishlistPage from './WishlistPage'
import NotificationsPage from './NotificationsPage'
import OrderTrackingPage from './OrderTrackingPage'
import DeliveryAddressForm from './DeliveryAddressForm'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'tracking', label: 'Tracking', icon: Package },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
]

export default function CustomerPortal() {
  const { user } = useAuth()
  const { isOpen, closePortal, activeTab, setActiveTab } = useCustomerPortal()
  const [trackOrderId, setTrackOrderId] = useState('')

  const handleTrackFromHistory = (orderId) => {
    setTrackOrderId(orderId)
    setActiveTab('tracking')
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CustomerDashboard onNavigate={setActiveTab} />
      case 'profile':
        return <CustomerProfile />
      case 'orders':
        return <OrderHistory onTrack={handleTrackFromHistory} />
      case 'wishlist':
        return <WishlistPage />
      case 'notifications':
        return <NotificationsPage />
      case 'tracking':
        return <OrderTrackingPage initialOrderId={trackOrderId} />
      case 'addresses':
        return <DeliveryAddressForm />
      default:
        return <CustomerDashboard onNavigate={setActiveTab} />
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={closePortal} ariaLabel="Customer account portal">
      <div className="flex min-h-[480px] flex-col md:flex-row">
        <nav className="shrink-0 border-b border-blush bg-blush/30 p-4 md:w-52 md:border-b-0 md:border-r">
          <h2 className="mb-4 font-display text-xl text-cocoa">My Account</h2>
          <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {TABS.map(({ id, label, icon: Icon }) => (
              <li key={id} className="shrink-0 md:shrink">
                <button
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex w-full items-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-caramel text-cream'
                      : 'text-espresso/70 hover:bg-cream hover:text-cocoa'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {!user ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
              <p className="font-display text-xl text-cocoa">Sign in to your account</p>
              <p className="mt-2 max-w-sm text-sm text-espresso/60">
                View orders, track deliveries, manage wishlist, and save delivery addresses.
              </p>
              <Button
                className="mt-6"
                magnetic
                onClick={() => {
                  closePortal()
                  window.dispatchEvent(new CustomEvent('ss-open-auth'))
                }}
              >
                Login / Sign Up
              </Button>
            </div>
          ) : (
            renderTab()
          )}
        </div>
      </div>
    </Modal>
  )
}

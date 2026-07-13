import { Shield, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCustomerPortal } from '../../context/CustomerPortalContext'
import { useNotification } from '../../context/NotificationContext'

export default function UserMenu() {
  const { user, logout, isAdmin, ready } = useAuth()
  const { openPortal } = useCustomerPortal()
  const { unreadCount } = useNotification()

  if (!ready || !user) return null

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => openPortal('dashboard')}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-caramel text-cream shadow-warm transition-colors hover:bg-champagne hover:text-espresso md:h-10 md:w-10"
        aria-label={`My Account — ${user.name}`}
        title="My Account"
      >
        <User size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-[9px] font-bold text-cream">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <span className="hidden max-w-[72px] truncate text-xs font-medium text-cocoa md:inline">
        {user.name.split(' ')[0]}
      </span>
      {isAdmin && (
        <a
          href="#admin"
          className="flex items-center gap-1 rounded-full bg-caramel/15 px-2.5 py-1.5 text-[11px] font-semibold text-caramel transition-colors hover:bg-caramel hover:text-cream md:text-xs"
          title="Store Dashboard"
        >
          <Shield size={12} /> <span className="hidden sm:inline">Dashboard</span>
        </a>
      )}
      <button
        type="button"
        onClick={logout}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush text-cocoa transition-colors hover:bg-caramel hover:text-cream md:h-10 md:w-10"
        aria-label="Logout"
        title="Logout"
      >
        <LogOut size={16} />
      </button>
    </div>
  )
}

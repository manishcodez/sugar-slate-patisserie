import { Bell, Loader2 } from 'lucide-react'
import { useNotification } from '../../context/NotificationContext'
import Button from '../ui/Button'

export default function NotificationsPage() {
  const { inbox, inboxLoading, markRead, markAllRead, loadInbox } = useNotification()

  if (inboxLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-espresso/60">
        <Loader2 size={24} className="animate-spin" />
      </div>
    )
  }

  if (!inbox.length) {
    return (
      <div className="py-12 text-center">
        <Bell size={40} className="mx-auto mb-3 text-blush" />
        <p className="text-sm text-espresso/70">No notifications yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-cocoa">Notifications</h3>
        <div className="flex gap-2">
          <button type="button" onClick={loadInbox} className="text-xs text-caramel hover:underline">
            Refresh
          </button>
          <button type="button" onClick={markAllRead} className="text-xs text-espresso/60 hover:underline">
            Mark all read
          </button>
        </div>
      </div>
      <ul className="space-y-2">
        {inbox.map((n) => (
          <li
            key={n.id}
            className={`rounded-[var(--radius-sm)] border px-4 py-3 ${
              n.read ? 'border-blush/60 bg-cream/50' : 'border-caramel/30 bg-caramel/5'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-cocoa">{n.title || 'Notification'}</p>
                <p className="mt-1 text-xs text-espresso/70">{n.message || n.body}</p>
                {n.createdAt && (
                  <p className="mt-1 text-[10px] text-espresso/50">
                    {new Date(n.createdAt).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
              {!n.read && (
                <Button type="button" variant="secondary" className="!px-2 !py-1 text-xs shrink-0" onClick={() => markRead(n.id)}>
                  Read
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

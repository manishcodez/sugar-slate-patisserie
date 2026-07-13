import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import Toast from '../components/ui/Toast'
import {
  fetchNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  addNotificationLocal,
} from '../services/api/notificationsApi'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [toast, setToast] = useState({ message: '', visible: false })
  const [inbox, setInbox] = useState([])
  const [inboxLoading, setInboxLoading] = useState(false)

  const showNotification = useCallback((message, duration = 4500) => {
    setToast({ message, visible: true })
    setTimeout(() => setToast({ message: '', visible: false }), duration)
  }, [])

  const loadInbox = useCallback(async () => {
    setInboxLoading(true)
    try {
      const res = await fetchNotificationsApi()
      if (res.ok) setInbox(Array.isArray(res.data) ? res.data : [])
    } finally {
      setInboxLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInbox()
  }, [loadInbox, user?.id])

  const pushInbox = useCallback((notification) => {
    const items = addNotificationLocal(notification)
    setInbox(items)
    return items
  }, [])

  const markRead = useCallback(async (id) => {
    await markNotificationReadApi(id)
    setInbox((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllRead = useCallback(async () => {
    await markAllNotificationsReadApi()
    setInbox((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const unreadCount = useMemo(() => inbox.filter((n) => !n.read).length, [inbox])

  const value = useMemo(
    () => ({
      showNotification,
      inbox,
      inboxLoading,
      loadInbox,
      pushInbox,
      markRead,
      markAllRead,
      unreadCount,
    }),
    [showNotification, inbox, inboxLoading, loadInbox, pushInbox, markRead, markAllRead, unreadCount],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toast message={toast.message} visible={toast.visible} />
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider')
  return ctx
}

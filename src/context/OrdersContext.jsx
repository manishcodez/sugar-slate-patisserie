import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { fetchOrdersApi, createOrderApi, trackOrderApi } from '../services/api/ordersApi'

const OrdersContext = createContext(null)

export function OrdersProvider({ children }) {
  const { user, ready } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refreshOrders = useCallback(async () => {
    if (!user?.id) {
      setOrders([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetchOrdersApi()
      if (res.ok) {
        const list = Array.isArray(res.data) ? res.data : []
        const filtered = list.filter(
          (o) => !o.userId || o.userId === user.id || o.customerEmail === user.email,
        )
        setOrders(filtered)
      }
    } catch (err) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!ready) return
    refreshOrders()
  }, [ready, refreshOrders])

  const addOrder = useCallback(async (order) => {
    const payload = {
      ...order,
      userId: user?.id,
      customerEmail: order.customerEmail || user?.email,
      customerName: order.customerName || user?.name,
      status: order.status || 'confirmed',
      timeline: order.timeline || [
        { stage: 'preparing', at: new Date().toISOString(), done: true },
      ],
    }
    const res = await createOrderApi(payload)
    if (res.ok) {
      setOrders((prev) => {
        if (prev.some((o) => o.id === res.data?.id)) return prev
        return [res.data, ...prev]
      })
    }
    return res
  }, [user])

  const prependOrder = useCallback((order) => {
    if (!order?.id) return
    const enriched = {
      ...order,
      userId: order.userId || user?.id,
      customerEmail: order.customerEmail || user?.email,
      customerName: order.customerName || user?.name,
    }
    setOrders((prev) => {
      if (prev.some((o) => o.id === enriched.id)) return prev
      return [enriched, ...prev]
    })
  }, [user])

  const trackOrder = useCallback(async (orderId, email = '') => {
    try {
      return await trackOrderApi(orderId, email)
    } catch (err) {
      return { ok: false, error: err.message || 'Order not found' }
    }
  }, [])

  const value = useMemo(
    () => ({ orders, loading, error, refreshOrders, addOrder, prependOrder, trackOrder }),
    [orders, loading, error, refreshOrders, addOrder, prependOrder, trackOrder],
  )

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export function useOrders() {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider')
  return ctx
}

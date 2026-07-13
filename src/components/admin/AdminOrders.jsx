import { useState, useEffect, useCallback, Fragment } from 'react'
import { Package, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'
import { fetchAdminOrdersApi, updateOrderStatusApi } from '../../services/api/adminApi'
import Button from '../ui/Button'

const STATUSES = ['preparing', 'baking', 'ready', 'delivery', 'delivered', 'confirmed', 'cancelled']

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchAdminOrdersApi()
      if (res.ok) setOrders(res.data?.orders ?? [])
      else setError('Could not load orders')
    } catch (err) {
      setError(err.message || 'Could not load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId)
    setStatusMsg('')
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    try {
      const res = await updateOrderStatusApi(orderId, status)
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: res.data.status } : o)))
        setStatusMsg(`Order ${orderId.slice(-8)} updated to ${status}`)
      } else {
        await load()
        setStatusMsg('Could not update status. Please try again.')
      }
    } catch {
      await load()
      setStatusMsg('Could not update status. Please try again.')
    }
    setUpdating('')
    setTimeout(() => setStatusMsg(''), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl text-cocoa">
            <Package size={20} className="text-caramel" /> Orders
          </h2>
          <p className="mt-1 text-sm text-espresso/60">Manage and update customer order status.</p>
        </div>
        <Button variant="secondary" onClick={load} className="gap-2 self-start" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </Button>
      </div>

      {statusMsg && (
        <p className="rounded-[var(--radius-sm)] bg-sage/15 px-4 py-2 text-sm text-sage">{statusMsg}</p>
      )}

      {error && (
        <p className="rounded-[var(--radius-sm)] bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="overflow-hidden rounded-[var(--radius-md)] border border-blush bg-cream shadow-warm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-blush bg-blush/50">
                <th className="px-4 py-3 font-semibold text-cocoa">Order ID</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Customer</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Total</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Date</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-espresso/50">Loading orders…</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-espresso/50">No orders yet.</td></tr>
              ) : (
                orders.map((order) => {
                  const items = order.items || []
                  const isExpanded = expandedId === order.id
                  return (
                  <Fragment key={order.id}>
                  <tr className="border-b border-blush/60 last:border-0">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? '' : order.id)}
                        className="flex items-center gap-1 font-mono text-xs text-caramel hover:underline"
                      >
                        {items.length > 0 ? (isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : null}
                        {order.id}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-cocoa">{order.customerName || '—'}</p>
                      <p className="text-xs text-espresso/50">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3">₹{Number(order.total || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-espresso/60">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="relative inline-flex items-center">
                        <select
                          value={order.status || 'preparing'}
                          disabled={updating === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="appearance-none rounded-[var(--radius-sm)] border border-blush bg-cream py-1.5 pl-3 pr-8 text-sm capitalize outline-none focus:border-caramel"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute right-2 text-espresso/40" />
                      </div>
                    </td>
                  </tr>
                  {isExpanded && items.length > 0 && (
                    <tr className="border-b border-blush/60 bg-blush/20">
                      <td colSpan={5} className="px-4 py-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-espresso/50">Order Items</p>
                        <ul className="space-y-1 text-sm">
                          {items.map((item, i) => (
                            <li key={item.id || i} className="flex justify-between gap-4 text-espresso/80">
                              <span>{item.name} × {item.quantity || 1}</span>
                              <span>₹{Number((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

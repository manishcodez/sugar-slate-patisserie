import { Loader2, Package } from 'lucide-react'
import { useOrders } from '../../context/OrdersContext'
import Button from '../ui/Button'

export default function OrderHistory({ onTrack }) {
  const { orders, loading, refreshOrders } = useOrders()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-espresso/60">
        <Loader2 size={24} className="animate-spin" />
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="py-12 text-center">
        <Package size={40} className="mx-auto mb-3 text-blush" />
        <p className="text-sm text-espresso/70">No orders yet. Start shopping from our menu!</p>
        <Button href="#menu" variant="secondary" className="mt-4">Browse Menu</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-cocoa">Order History</h3>
        <button type="button" onClick={refreshOrders} className="text-xs text-caramel hover:underline">
          Refresh
        </button>
      </div>
      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order.id} className="rounded-[var(--radius-md)] border border-blush bg-cream p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-sm font-semibold text-caramel">{order.id}</p>
                <p className="text-xs text-espresso/60">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  }) : '—'}
                </p>
              </div>
              <span className="rounded-full bg-caramel/15 px-3 py-1 text-xs font-medium capitalize text-caramel">
                {order.status || 'confirmed'}
              </span>
            </div>
            <p className="mt-2 text-sm text-cocoa">
              {order.items?.length
                ? `${order.items.length} item${order.items.length > 1 ? 's' : ''}`
                : order.type === 'custom-cake' ? 'Custom Cake Request' : 'Order'}
              {' · '}
              ₹{(order.total || 0).toLocaleString('en-IN')}
            </p>
            <button
              type="button"
              onClick={() => onTrack(order.id)}
              className="mt-3 text-sm font-medium text-caramel hover:underline"
            >
              Track Order
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

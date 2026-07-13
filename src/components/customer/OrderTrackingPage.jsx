import { useState } from 'react'
import { AlertCircle, Loader2, Search } from 'lucide-react'
import { useOrders } from '../../context/OrdersContext'
import { ORDER_TRACKING_STAGES, getOrderTrackingIndex } from '../../data/cakeBuilder'
import Button from '../ui/Button'

export default function OrderTrackingPage({ initialOrderId = '' }) {
  const { trackOrder } = useOrders()
  const [orderId, setOrderId] = useState(initialOrderId)
  const [email, setEmail] = useState('')
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (e) => {
    e?.preventDefault()
    const id = orderId.trim()
    if (!id) {
      setError('Please enter an order ID')
      return
    }
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Please enter the email used when placing the order')
      return
    }
    setLoading(true)
    setError('')
    const res = await trackOrder(id, trimmedEmail)
    setLoading(false)
    if (res.ok) {
      setTracking(res.data)
    } else {
      setTracking(null)
      setError(res.error || 'Order not found')
    }
  }

  const statusIndex = tracking?.status ? getOrderTrackingIndex(tracking.status) : 0
  const isCancelled = tracking?.status === 'cancelled'

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg text-cocoa">Track Your Order</h3>
      <p className="text-sm text-espresso/60">Enter your order ID and the email address used at checkout.</p>
      <form onSubmit={handleTrack} className="space-y-3">
        <input
          value={orderId}
          onChange={(e) => { setOrderId(e.target.value); setError('') }}
          placeholder="e.g. ORD-1783880040886-82m6fg"
          className="form-input w-full"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError('') }}
          placeholder="Email used for the order"
          className="form-input w-full"
        />
        <Button type="submit" magnetic disabled={loading} className="w-full sm:w-auto">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><Search size={16} className="mr-2 inline" />Track Order</>}
        </Button>
      </form>
      {error && (
        <p className="flex items-center gap-1 text-sm text-red-700">
          <AlertCircle size={14} /> {error}
        </p>
      )}
      {tracking && (
        <div className="rounded-[var(--radius-md)] border border-blush bg-cream p-4">
          <p className="font-mono text-sm font-semibold text-caramel">{tracking.orderId}</p>
          <p className="mt-1 text-xs capitalize text-espresso/60">Status: {tracking.status}</p>
          {isCancelled ? (
            <p className="mt-4 rounded-[var(--radius-sm)] bg-red-50 px-3 py-2 text-sm text-red-700">
              This order was cancelled.
            </p>
          ) : (
          <ol className="mt-4 space-y-3">
            {ORDER_TRACKING_STAGES.map((stage, i) => (
              <li key={stage.id} className="flex gap-3">
                <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  i <= statusIndex ? 'bg-caramel text-cream' : 'bg-blush text-espresso/40'
                }`}>
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-cocoa">{stage.label}</p>
                  <p className="text-xs text-espresso/60">{stage.description}</p>
                </div>
              </li>
            ))}
          </ol>
          )}
        </div>
      )}
    </div>
  )
}

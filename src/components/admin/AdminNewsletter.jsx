import { useState, useEffect, useCallback } from 'react'
import { Mail, RefreshCw } from 'lucide-react'
import { fetchNewsletterSubscribersApi } from '../../services/api/adminApi'
import Button from '../ui/Button'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchNewsletterSubscribersApi()
      if (res.ok) {
        setSubscribers(res.data?.subscribers ?? [])
        setTotal(res.data?.total ?? res.data?.subscribers?.length ?? 0)
      } else {
        setError('Could not load subscribers')
      }
    } catch (err) {
      setError(err.message || 'Could not load subscribers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl text-cocoa">
            <Mail size={20} className="text-caramel" /> Newsletter Subscribers
          </h2>
          <p className="mt-1 text-sm text-espresso/60">
            {total > 0 ? `${total} subscriber${total === 1 ? '' : 's'}` : 'Emails collected from the footer signup form.'}
          </p>
        </div>
        <Button variant="secondary" onClick={load} className="gap-2 self-start" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </Button>
      </div>

      {error && (
        <p className="rounded-[var(--radius-sm)] bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="overflow-hidden rounded-[var(--radius-md)] border border-blush bg-cream shadow-warm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-blush bg-blush/50">
                <th className="px-4 py-3 font-semibold text-cocoa">#</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Email</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-espresso/50">Loading subscribers…</td></tr>
              ) : subscribers.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-espresso/50">No subscribers yet.</td></tr>
              ) : (
                subscribers.map((sub, i) => (
                  <tr key={sub.email} className="border-b border-blush/60 last:border-0">
                    <td className="px-4 py-3 text-espresso/50">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-cocoa">{sub.email}</td>
                    <td className="px-4 py-3 text-espresso/60">{formatDate(sub.subscribedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

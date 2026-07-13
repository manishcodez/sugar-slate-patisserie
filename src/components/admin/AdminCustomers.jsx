import { useState, useEffect, useCallback } from 'react'
import { Users, RefreshCw, Mail, Phone, Calendar } from 'lucide-react'
import { fetchCustomersApi, fetchCustomerStatsApi } from '../../services/api/adminApi'
import Button from '../ui/Button'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isRecentSignup(createdAt) {
  if (!createdAt) return false
  return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [stats, setStats] = useState({ total: 0, today: 0, thisWeek: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [offline, setOffline] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [listRes, statsRes] = await Promise.all([
        fetchCustomersApi(),
        fetchCustomerStatsApi(),
      ])
      setCustomers(listRes.data?.customers ?? [])
      setStats(statsRes.data ?? { total: 0, today: 0, thisWeek: 0 })
      setOffline(Boolean(listRes.offline))
    } catch (err) {
      setError(err.message || 'Could not load customers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl text-cocoa">
            <Users size={20} className="text-caramel" /> Registered Customers
          </h2>
          <p className="mt-1 text-sm text-espresso/60">
            Everyone who signed up on your site appears here.
            {offline && ' (Showing local demo data — API offline)'}
          </p>
        </div>
        <Button variant="secondary" onClick={load} className="gap-2 self-start" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total customers', value: stats.total },
          { label: 'Signed up today', value: stats.today },
          { label: 'This week', value: stats.thisWeek },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[var(--radius-md)] border border-blush bg-blush/30 px-5 py-4 text-center"
          >
            <p className="text-2xl font-display text-cocoa">{item.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-espresso/50">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-[var(--radius-sm)] bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-[var(--radius-md)] border border-blush bg-cream shadow-warm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-blush bg-blush/50">
                <th className="px-4 py-3 font-semibold text-cocoa">Name</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Email</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Phone</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Signed up</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-espresso/50">
                    Loading customers…
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-espresso/50">
                    No customers yet. Share your site so people can sign up!
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-blush/60 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-cocoa">{customer.name}</span>
                        {isRecentSignup(customer.createdAt) && (
                          <span className="rounded bg-caramel/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-caramel">
                            New
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${customer.email}`}
                        className="inline-flex items-center gap-1 text-espresso/70 hover:text-caramel"
                      >
                        <Mail size={12} /> {customer.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-espresso/70">
                      {customer.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone size={12} /> {customer.phone}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-espresso/60">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} /> {formatDate(customer.createdAt)}
                      </span>
                    </td>
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

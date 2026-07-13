import { useState, useEffect, useCallback } from 'react'
import { Cake, RefreshCw, ChevronDown, Eye, X } from 'lucide-react'
import { fetchCustomCakesApi, updateCustomCakeStatusApi } from '../../services/api/adminApi'
import Button from '../ui/Button'

const STATUSES = ['pending', 'reviewing', 'quoted', 'confirmed', 'in-progress', 'completed', 'cancelled']

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminCustomCakes() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState('')
  const [selected, setSelected] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchCustomCakesApi()
      if (res.ok) setRequests(res.data?.requests ?? [])
      else setError('Could not load custom cake requests')
    } catch (err) {
      setError(err.message || 'Could not load custom cake requests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (id, status) => {
    setUpdating(id)
    const res = await updateCustomCakeStatusApi(id, status)
    if (res.ok) {
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: res.data.status } : r)))
    } else {
      setError('Could not update status')
    }
    setUpdating('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl text-cocoa">
            <Cake size={20} className="text-caramel" /> Custom Cake Requests
          </h2>
          <p className="mt-1 text-sm text-espresso/60">Cake builder submissions from customers.</p>
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
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-blush bg-blush/50">
                <th className="px-4 py-3 font-semibold text-cocoa">Request ID</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Customer</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Estimate</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Date</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Status</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-espresso/50">Loading requests…</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-espresso/50">No custom cake requests yet.</td></tr>
              ) : (
                requests.map((req) => {
                  const payload = req.payload || {}
                  return (
                    <tr key={req.id} className="border-b border-blush/60 last:border-0">
                      <td className="px-4 py-3 font-mono text-xs text-caramel">{req.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-cocoa">{payload.customerName || payload.name || '—'}</p>
                        <p className="text-xs text-espresso/50">{payload.email || payload.customerEmail || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        {req.estimatedMin != null
                          ? `₹${Number(req.estimatedMin).toLocaleString('en-IN')} – ₹${Number(req.estimatedMax).toLocaleString('en-IN')}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-espresso/60">{formatDate(req.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="relative inline-flex items-center">
                          <select
                            value={req.status || 'pending'}
                            disabled={updating === req.id}
                            onChange={(e) => handleStatusChange(req.id, e.target.value)}
                            className="appearance-none rounded-[var(--radius-sm)] border border-blush bg-cream py-1.5 pl-3 pr-8 text-sm capitalize outline-none focus:border-caramel"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="pointer-events-none absolute right-2 text-espresso/40" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelected(req)}
                          className="flex items-center gap-1 text-xs font-semibold text-caramel hover:underline"
                        >
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-espresso/50 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-[var(--radius-md)] border border-blush bg-cream shadow-warm-lg">
            <div className="flex items-center justify-between border-b border-blush px-5 py-4">
              <div>
                <h3 className="font-display text-lg text-cocoa">Request {selected.id}</h3>
                <p className="text-xs text-espresso/60">{formatDate(selected.createdAt)}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close details" className="rounded-full p-2 hover:bg-blush">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[calc(85vh-4rem)] overflow-y-auto p-5">
              <pre className="whitespace-pre-wrap break-words rounded-[var(--radius-sm)] bg-blush/30 p-4 font-mono text-xs text-espresso/80">
                {JSON.stringify(selected.payload || selected, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

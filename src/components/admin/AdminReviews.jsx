import { useState, useEffect, useCallback } from 'react'
import { Star, RefreshCw, Trash2, Check, X } from 'lucide-react'
import { fetchAdminReviewsApi, approveReviewApi, deleteReviewApi } from '../../services/api/adminApi'
import Button from '../ui/Button'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchAdminReviewsApi()
      if (res.ok) setReviews(res.data?.reviews ?? [])
      else setError('Could not load reviews')
    } catch (err) {
      setError(err.message || 'Could not load reviews')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleApprove = async (id, approved) => {
    setUpdating(id)
    const res = await approveReviewApi(id, approved)
    if (res.ok) {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved: res.data.approved } : r)))
    } else {
      setError('Could not update review')
    }
    setUpdating('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return
    setUpdating(id)
    const res = await deleteReviewApi(id)
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } else {
      setError('Could not delete review')
    }
    setUpdating('')
  }

  const pending = reviews.filter((r) => !r.approved).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl text-cocoa">
            <Star size={20} className="text-caramel" /> Customer Reviews
          </h2>
          <p className="mt-1 text-sm text-espresso/60">
            Moderate reviews before they appear on the website.
            {pending > 0 && <span className="ml-1 font-medium text-caramel">({pending} pending)</span>}
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
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-blush bg-blush/50">
                <th className="px-4 py-3 font-semibold text-cocoa">Customer</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Rating</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Review</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Status</th>
                <th className="px-4 py-3 font-semibold text-cocoa">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-espresso/50">Loading reviews…</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-espresso/50">No reviews yet.</td></tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="border-b border-blush/60 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-cocoa">{review.name || '—'}</p>
                      <p className="text-xs text-espresso/50">{formatDate(review.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-0.5 text-caramel">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} fill={i < (review.rating || 0) ? 'currentColor' : 'none'} />
                        ))}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <p className="line-clamp-3 text-espresso/80">{review.quote}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${
                        review.approved ? 'bg-sage/20 text-sage' : 'bg-caramel/15 text-caramel'
                      }`}>
                        {review.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {!review.approved ? (
                          <button
                            type="button"
                            disabled={updating === review.id}
                            onClick={() => handleApprove(review.id, true)}
                            className="flex items-center gap-1 text-xs font-semibold text-sage hover:underline"
                          >
                            <Check size={12} /> Approve
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={updating === review.id}
                            onClick={() => handleApprove(review.id, false)}
                            className="flex items-center gap-1 text-xs font-semibold text-espresso/60 hover:underline"
                          >
                            <X size={12} /> Hide
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={updating === review.id}
                          onClick={() => handleDelete(review.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
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

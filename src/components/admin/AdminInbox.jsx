import { useState, useEffect, useCallback } from 'react'
import { Mail, RefreshCw, MessageSquare } from 'lucide-react'
import { fetchAdminMessagesApi } from '../../services/api/adminApi'
import Button from '../ui/Button'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminInbox() {
  const [contact, setContact] = useState([])
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('contact')
  const [error, setError] = useState('')
  const [offline, setOffline] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchAdminMessagesApi()
      if (res.ok) {
        setContact(res.data?.contact ?? [])
        setFeedback(res.data?.feedback ?? [])
        setOffline(Boolean(res.offline))
      } else {
        setError('Could not load messages')
      }
    } catch (err) {
      setError(err.message || 'Could not load messages')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const messages = tab === 'contact' ? contact : feedback

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl text-cocoa">
            <Mail size={20} className="text-caramel" /> Messages
          </h2>
          <p className="mt-1 text-sm text-espresso/60">
            Contact form submissions and customer feedback.
            {offline && ' (Showing locally saved messages — start API for live inbox)'}
          </p>
        </div>
        <Button variant="secondary" onClick={load} className="gap-2 self-start" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </Button>
      </div>

      {error && (
        <p className="rounded-[var(--radius-sm)] bg-red-50 px-4 py-3 text-center text-sm text-red-700">{error}</p>
      )}

      <div className="flex gap-2 rounded-[var(--radius-sm)] bg-blush/50 p-1">
        {[
          { id: 'contact', label: `Contact (${contact.length})` },
          { id: 'feedback', label: `Feedback (${feedback.length})` },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 rounded-[var(--radius-sm)] py-2 text-sm font-medium transition-colors ${
              tab === id ? 'bg-caramel text-cream' : 'text-espresso/70 hover:text-cocoa'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-sm text-espresso/50 py-8">Loading messages…</p>
      ) : messages.length === 0 ? (
        <p className="text-center text-sm text-espresso/50 py-8">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="rounded-[var(--radius-md)] border border-blush bg-cream p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-cocoa">{msg.name}</p>
                  <a href={`mailto:${msg.email}`} className="text-xs text-caramel hover:underline">{msg.email}</a>
                </div>
                <span className="text-xs text-espresso/50">{formatDate(msg.createdAt)}</span>
              </div>
              {msg.subject && <p className="mt-2 text-sm font-medium text-espresso/80">Subject: {msg.subject}</p>}
              {msg.category && (
                <p className="mt-1 text-xs text-espresso/60">
                  {msg.category} {msg.rating ? `· ${msg.rating}★` : ''}
                </p>
              )}
              <p className="mt-2 flex gap-2 text-sm text-espresso/70">
                <MessageSquare size={14} className="mt-0.5 shrink-0 text-caramel" />
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { submitFeedbackApi } from '../services/api/feedbackApi'
import { isRequired, isValidEmail } from '../utils/validation'
import Button from './ui/Button'

const CATEGORIES = [
  'Product Quality',
  'Delivery Experience',
  'Customer Service',
  'Website Experience',
  'Custom Cake Experience',
  'Other',
]

export default function FeedbackForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: '',
    rating: '5',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
    setSuccess('')
    setError('')
  }

  const validate = () => {
    const e = {}
    if (!isRequired(form.name)) e.name = 'Name is required'
    if (!isRequired(form.email)) e.email = 'Email is required'
    else if (!isValidEmail(form.email)) e.email = 'Enter a valid email'
    if (!isRequired(form.category)) e.category = 'Please select a category'
    if (!isRequired(form.message)) e.message = 'Feedback message is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const res = await submitFeedbackApi({
      ...form,
      rating: Number(form.rating),
    })
    setLoading(false)
    if (res.ok) {
      setSuccess(res.message || 'Thank you for your feedback!')
      setForm({ name: '', email: '', category: '', rating: '5', message: '' })
    } else {
      setError(res.error || 'Failed to submit feedback')
    }
  }

  return (
    <div className="mt-10 rounded-[var(--radius-lg)] border border-blush bg-cream/80 p-6 shadow-warm md:p-8">
      <h3 className="mb-1 font-display text-xl text-cocoa">Share Your Feedback</h3>
      <p className="mb-5 text-sm text-espresso/70">
        Help us improve — tell us about your experience at Sugar &amp; Slate.
      </p>

      {success ? (
        <p className="rounded-[var(--radius-sm)] bg-sage/15 px-4 py-3 text-center text-sm font-medium text-sage">
          {success}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Name *</label>
              <input value={form.name} onChange={(e) => update('name', e.target.value)} className="form-input" />
              {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email *</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="form-input" />
              {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Category *</label>
              <select value={form.category} onChange={(e) => update('category', e.target.value)} className="form-input">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-700">{errors.category}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Overall Rating</label>
              <select value={form.rating} onChange={(e) => update('rating', e.target.value)} className="form-input">
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Your Feedback *</label>
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              className="form-input resize-y"
              placeholder="What did you love? What can we do better?"
            />
            {errors.message && <p className="mt-1 text-xs text-red-700">{errors.message}</p>}
          </div>
          {error && (
            <p className="flex items-center gap-1 text-sm text-red-700">
              <AlertCircle size={14} /> {error}
            </p>
          )}
          <Button type="submit" magnetic disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      )}
    </div>
  )
}

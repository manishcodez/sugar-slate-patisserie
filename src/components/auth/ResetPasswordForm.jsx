import { useState } from 'react'
import { AlertCircle, KeyRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { isValidEmail, isValidPassword, passwordsMatch } from '../../utils/validation'
import Button from '../ui/Button'

export default function ResetPasswordForm({ initialEmail = '', initialToken = '', onBack, onSuccess }) {
  const { resetPassword } = useAuth()
  const [form, setForm] = useState({ email: initialEmail, token: initialToken, password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email address')
      return
    }
    if (!form.token.trim()) {
      setError('Reset code is required — check your email or request a new one')
      return
    }
    if (!isValidPassword(form.password)) {
      setError('Password must be at least 6 characters')
      return
    }
    if (!passwordsMatch(form.password, form.confirm)) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const result = await resetPassword(form)
    setLoading(false)

    if (result.ok) {
      setSuccess(result.message)
      setForm({ email: form.email, token: form.token, password: '', confirm: '' })
      if (onSuccess) onSuccess()
    } else {
      setError(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-espresso/70">
        Enter your email and choose a new password. You must request a reset link first via Forgot Password.
      </p>
      <div>
        <label htmlFor="reset-token" className="mb-1 block text-sm font-medium">Reset Code</label>
        <input
          id="reset-token"
          type="text"
          required
          value={form.token}
          onChange={(e) => update('token', e.target.value)}
          className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 font-mono text-sm outline-none focus:border-caramel"
          placeholder="Paste code from your email"
        />
      </div>
      <div>
        <label htmlFor="reset-email" className="mb-1 block text-sm font-medium">Email</label>
        <input
          id="reset-email"
          type="email"
          required
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="reset-password" className="mb-1 block text-sm font-medium">New Password</label>
        <input
          id="reset-password"
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel"
        />
      </div>
      <div>
        <label htmlFor="reset-confirm" className="mb-1 block text-sm font-medium">Confirm Password</label>
        <input
          id="reset-confirm"
          type="password"
          required
          value={form.confirm}
          onChange={(e) => update('confirm', e.target.value)}
          className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel"
        />
      </div>
      {error && (
        <p className="flex items-center gap-1 text-sm text-red-700" role="alert">
          <AlertCircle size={14} /> {error}
        </p>
      )}
      {success && (
        <p className="rounded-[var(--radius-sm)] bg-sage/15 px-4 py-3 text-sm text-espresso">{success}</p>
      )}
      <Button type="submit" className="w-full" magnetic disabled={loading}>
        {loading ? 'Updating...' : <><KeyRound size={16} className="mr-2 inline" />Update Password</>}
      </Button>
      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-sm text-caramel hover:underline"
      >
        Back to Login
      </button>
    </form>
  )
}

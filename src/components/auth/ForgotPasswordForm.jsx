import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { isValidEmail } from '../../utils/validation'
import Button from '../ui/Button'

export default function ForgotPasswordForm({ onBack, onContinueToReset }) {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetToken, setResetToken] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setResetEmail('')

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    const result = await forgotPassword({ email })
    setLoading(false)

    if (result.ok) {
      setSuccess(result.message || 'Check your email for reset instructions.')
      if (result.devResetToken && result.email) {
        setResetEmail(result.email)
        setResetToken(result.devResetToken)
      }
      setEmail('')
    } else {
      setError(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-espresso/70">
        Enter your email and we&apos;ll send you instructions to reset your password.
      </p>
      <div>
        <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium">Email</label>
        <input
          id="forgot-email"
          type="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError('') }}
          className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel"
          placeholder="you@example.com"
        />
      </div>
      {error && (
        <p className="flex items-center gap-1 text-sm text-red-700" role="alert">
          <AlertCircle size={14} /> {error}
        </p>
      )}
      {success && (
        <div className="space-y-3">
          <p className="rounded-[var(--radius-sm)] bg-sage/15 px-4 py-3 text-sm text-espresso">{success}</p>
          {resetEmail && onContinueToReset && (
            <Button type="button" className="w-full" magnetic onClick={() => onContinueToReset(resetEmail, resetToken)}>
              Set New Password
            </Button>
          )}
        </div>
      )}
      {!success && (
        <Button type="submit" className="w-full" magnetic disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      )}
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

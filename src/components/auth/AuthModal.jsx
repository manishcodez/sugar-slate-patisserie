import { useState, useEffect } from 'react'
import { LogIn, UserPlus, KeyRound, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import ForgotPasswordForm from './ForgotPasswordForm'
import ResetPasswordForm from './ResetPasswordForm'

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const { signup, login } = useAuth()
  const [tab, setTab] = useState(initialTab)
  const [resetEmail, setResetEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirm: '' })

  const reset = () => {
    setError('')
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab)
      if (initialTab !== 'reset') {
        setResetEmail('')
        setResetToken('')
      }
      reset()
    }
  }, [isOpen, initialTab])

  useEffect(() => {
    const onResetLink = (e) => {
      const { token, email } = e.detail || {}
      if (email) setResetEmail(email)
      if (token) setResetToken(token)
      setTab('reset')
    }
    window.addEventListener('ss-reset-password', onResetLink)
    return () => window.removeEventListener('ss-reset-password', onResetLink)
  }, [])

  const titles = {
    login: { icon: LogIn, label: 'Login' },
    signup: { icon: UserPlus, label: 'Create Account' },
    forgot: { icon: KeyRound, label: 'Forgot Password' },
    reset: { icon: Lock, label: 'Reset Password' },
  }
  const header = titles[tab] || titles.login
  const HeaderIcon = header.icon

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(loginForm)
    setLoading(false)
    if (result.ok) {
      onClose()
      setLoginForm({ email: '', password: '' })
    } else {
      setError(result.error)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (signupForm.password !== signupForm.confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    const result = await signup({
      name: signupForm.name,
      email: signupForm.email,
      password: signupForm.password,
    })
    setLoading(false)
    if (result.ok) {
      onClose()
      setSignupForm({ name: '', email: '', password: '', confirm: '' })
    } else {
      setError(result.error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Account login or signup">
      <div className="p-6 md:p-8">
        <div className="mb-5 flex items-center gap-2">
          <HeaderIcon size={20} className="text-caramel" />
          <h3 className="font-display text-lg text-cocoa">{header.label}</h3>
        </div>

        {tab === 'forgot' ? (
          <ForgotPasswordForm
            onBack={() => { setTab('login'); reset() }}
            onContinueToReset={(email, token) => { setResetEmail(email); setResetToken(token || ''); setTab('reset'); reset() }}
          />
        ) : tab === 'reset' ? (
          <ResetPasswordForm
            initialEmail={resetEmail}
            initialToken={resetToken}
            onBack={() => { setTab('login'); reset() }}
            onSuccess={() => { setTab('login'); reset() }}
          />
        ) : tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium">Password</label>
                <button
                  type="button"
                  onClick={() => { setTab('forgot'); reset() }}
                  className="text-xs text-caramel hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel"
                placeholder="Your password"
              />
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <Button type="submit" className="w-full" magnetic disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Full Name</label>
              <input
                type="text"
                required
                value={signupForm.name}
                onChange={(e) => setSignupForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel"
                placeholder="Priya Sharma"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={signupForm.email}
                onChange={(e) => setSignupForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel"
                placeholder="you@example.com"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={signupForm.password}
                  onChange={(e) => setSignupForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Confirm</label>
                <input
                  type="password"
                  required
                  value={signupForm.confirm}
                  onChange={(e) => setSignupForm((f) => ({ ...f, confirm: e.target.value }))}
                  className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel"
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <Button type="submit" className="w-full" magnetic disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        )}

      </div>
    </Modal>
  )
}

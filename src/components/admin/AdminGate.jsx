import { useState } from 'react'
import { Lock, Shield, Store } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

export default function AdminGate({ onSuccess }) {
  const { adminLogin } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await adminLogin(loginForm)
    setLoading(false)
    if (result.ok) {
      onSuccess?.()
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-caramel/15">
          <Shield size={26} className="text-caramel" />
        </div>
      </div>
      <h1 className="mb-2 text-center font-display text-3xl text-cocoa">Store Dashboard</h1>
      <p className="mb-6 text-center text-sm text-espresso/70">
        Shop owner login — manage orders, menu, customers, and messages.
      </p>

      <div className="mb-6 rounded-[var(--radius-md)] border border-blush bg-blush/40 p-4 text-center text-sm text-espresso/80">
        <p className="font-medium text-cocoa">Looking for the bakery shop website?</p>
        <p className="mt-1 text-xs text-espresso/60">
          Customers visit the main site — not this page. This screen is only for the shop owner.
        </p>
        <a
          href="/"
          className="mt-3 inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-caramel px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-champagne hover:text-espresso"
        >
          <Store size={14} /> Open Customer Website
        </a>
      </div>

      {error && (
        <p className="mb-4 rounded-[var(--radius-sm)] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <form onSubmit={handleLogin} className="space-y-4 rounded-[var(--radius-md)] border border-blush bg-cream p-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Admin Email</label>
          <input
            type="email"
            required
            value={loginForm.email}
            onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel"
            placeholder="admin@sugarslate.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={loginForm.password}
            onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-3 outline-none focus:border-caramel"
          />
        </div>
        <Button type="submit" className="w-full gap-2" magnetic disabled={loading}>
          <Lock size={16} /> {loading ? 'Logging in...' : 'Login to Dashboard'}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-espresso/50">
        Private owner link only — bookmark <code className="text-caramel">yoursite.com/#admin</code> and keep your password safe.
      </p>
    </div>
  )
}

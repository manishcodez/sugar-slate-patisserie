import { useState, useEffect } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { isRequired, isValidPhone } from '../../utils/validation'
import Button from '../ui/Button'

export default function CustomerProfile() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
      })
    }
  }, [user])

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
    setSuccess('')
    setError('')
  }

  const validate = () => {
    const e = {}
    if (!isRequired(form.name)) e.name = 'Name is required'
    if (form.phone && !isValidPhone(form.phone)) e.phone = 'Enter a valid phone number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError('')
    const result = await updateProfile({ name: form.name, phone: form.phone })
    setLoading(false)
    if (result.ok) {
      setSuccess('Profile updated successfully.')
    } else {
      setError(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Full Name *</label>
        <input
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className="form-input"
        />
        {errors.name && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-700">
            <AlertCircle size={12} /> {errors.name}
          </p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input value={form.email} disabled className="form-input opacity-60" />
        <p className="mt-1 text-xs text-espresso/50">Email cannot be changed here.</p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Phone</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          className="form-input"
          placeholder="+91 98765 43210"
        />
        {errors.phone && (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-700">
            <AlertCircle size={12} /> {errors.phone}
          </p>
        )}
      </div>
      {success && <p className="text-sm text-sage">{success}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button type="submit" magnetic disabled={loading}>
        {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Profile'}
      </Button>
    </form>
  )
}

import { useState, useEffect } from 'react'
import { AlertCircle, Loader2, MapPin, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  fetchAddressesApi,
  createAddressApi,
  deleteAddressApi,
  setDefaultAddressApi,
  migrateLegacyAddresses,
} from '../../services/api/addressesApi'
import { checkPincode } from '../../data/deliveryZones'
import { isRequired, isValidPincode, isValidPhone } from '../../utils/validation'
import Button from '../ui/Button'

const EMPTY = {
  label: 'Home',
  name: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: 'Varanasi',
  pincode: '',
  instructions: '',
}

export default function DeliveryAddressForm() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const loadAddresses = async () => {
    if (!user?.id) {
      setAddresses([])
      setListLoading(false)
      return
    }
    setListLoading(true)
    migrateLegacyAddresses(user.id)
    const res = await fetchAddressesApi(user.id)
    if (res.ok) setAddresses(Array.isArray(res.data) ? res.data : [])
    setListLoading(false)
  }

  useEffect(() => {
    loadAddresses()
  }, [user?.id])

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
    setSuccess('')
    setError('')
  }

  const validate = () => {
    const e = {}
    if (!isRequired(form.name)) e.name = 'Name is required'
    if (!isRequired(form.phone)) e.phone = 'Phone is required'
    else if (!isValidPhone(form.phone)) e.phone = 'Enter a valid phone number'
    if (!isRequired(form.addressLine1)) e.addressLine1 = 'Address is required'
    if (!isValidPincode(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode'
    else {
      const zone = checkPincode(form.pincode)
      if (!zone.available) e.pincode = zone.message || 'Sorry, we do not deliver to this pincode'
    }
    if (!isRequired(form.city)) e.city = 'City is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const res = await createAddressApi(form, user?.id)
    setLoading(false)
    if (res.ok) {
      setSuccess('Address saved successfully.')
      setForm(EMPTY)
      loadAddresses()
    } else {
      setError(res.error || 'Failed to save address')
    }
  }

  const handleDelete = async (id) => {
    await deleteAddressApi(id, user?.id)
    loadAddresses()
  }

  const handleSetDefault = async (id) => {
    await setDefaultAddressApi(id, user?.id)
    loadAddresses()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg text-cocoa">Saved Addresses</h3>
        {listLoading ? (
          <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-espresso/50" /></div>
        ) : addresses.length === 0 ? (
          <p className="mt-2 text-sm text-espresso/60">No saved addresses yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {addresses.map((addr) => (
              <li key={addr.id} className="rounded-[var(--radius-sm)] border border-blush p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-cocoa">
                      {addr.label} {addr.isDefault && <span className="text-xs text-caramel">(Default)</span>}
                    </p>
                    <p className="text-espresso/70">{addr.name} · {addr.phone}</p>
                    <p className="text-espresso/70">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                    <p className="text-espresso/70">{addr.city} — {addr.pincode}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {!addr.isDefault && (
                      <button type="button" onClick={() => handleSetDefault(addr.id)} className="text-xs text-caramel hover:underline">
                        Default
                      </button>
                    )}
                    <button type="button" onClick={() => handleDelete(addr.id)} aria-label="Delete address">
                      <Trash2 size={14} className="text-red-700" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 border-t border-blush pt-6">
        <h4 className="flex items-center gap-2 font-display text-base text-cocoa">
          <MapPin size={18} className="text-caramel" /> Add New Address
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Label</label>
            <select value={form.label} onChange={(e) => update('label', e.target.value)} className="form-input">
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Full Name *</label>
            <input value={form.name} onChange={(e) => update('name', e.target.value)} className="form-input" />
            {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone *</label>
          <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="form-input" />
          {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Address Line 1 *</label>
          <input value={form.addressLine1} onChange={(e) => update('addressLine1', e.target.value)} className="form-input" />
          {errors.addressLine1 && <p className="mt-1 text-xs text-red-700">{errors.addressLine1}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Address Line 2</label>
          <input value={form.addressLine2} onChange={(e) => update('addressLine2', e.target.value)} className="form-input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">City *</label>
            <input value={form.city} onChange={(e) => update('city', e.target.value)} className="form-input" />
            {errors.city && <p className="mt-1 text-xs text-red-700">{errors.city}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Pincode *</label>
            <input
              value={form.pincode}
              onChange={(e) => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              inputMode="numeric"
              className="form-input"
            />
            {errors.pincode && <p className="mt-1 text-xs text-red-700">{errors.pincode}</p>}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Delivery Instructions</label>
          <textarea rows={2} value={form.instructions} onChange={(e) => update('instructions', e.target.value)} className="form-input" />
        </div>
        {success && <p className="text-sm text-sage">{success}</p>}
        {error && <p className="flex items-center gap-1 text-sm text-red-700"><AlertCircle size={14} /> {error}</p>}
        <Button type="submit" magnetic disabled={loading}>
          {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Address'}
        </Button>
      </form>
    </div>
  )
}

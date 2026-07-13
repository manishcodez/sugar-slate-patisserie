import { useState } from 'react'
import { MapPin, CheckCircle, XCircle } from 'lucide-react'
import { checkPincode } from '../data/deliveryZones'
import Button from './ui/Button'

export default function PincodeChecker({ compact = false, onResult }) {
  const [pincode, setPincode] = useState('')
  const [result, setResult] = useState(null)

  const handleCheck = () => {
    const info = checkPincode(pincode)
    setResult(info)
    onResult?.(info)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCheck()
    }
  }

  return (
    <div className={compact ? 'min-w-0 max-w-full' : 'min-w-0 max-w-full rounded-[var(--radius-md)] border border-blush bg-cream p-4 shadow-warm sm:p-5'}>
      {!compact && (
        <div className="mb-3 flex items-center gap-2">
          <MapPin size={18} className="text-caramel" />
          <h3 className="font-display text-lg text-cocoa">Check Delivery Availability</h3>
        </div>
      )}
      <p className={`text-sm text-espresso/70 ${compact ? 'mb-2' : 'mb-4'}`}>
        Enter your pincode to see if we deliver to your area.
      </p>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, ''))
            setResult(null)
          }}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 221307"
          aria-label="Enter pincode"
          className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-2.5 outline-none focus:border-caramel"
        />
        <Button type="button" onClick={handleCheck} magnetic={!compact} size="sm" className="w-full shrink-0 sm:w-auto">
          Check
        </Button>
      </div>

      {result && (
        <div
          className={`mt-3 flex items-start gap-2 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm ${
            result.available
              ? 'bg-sage/15 text-espresso'
              : result.valid
                ? 'bg-red-50 text-red-800'
                : 'bg-amber-50 text-amber-900'
          }`}
          role="status"
        >
          {result.available ? (
            <CheckCircle size={18} className="mt-0.5 shrink-0 text-sage" />
          ) : (
            <XCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
          )}
          <div>
            <p className="font-medium">
              {result.available ? 'Delivery Available' : result.message}
            </p>
            {result.available && (
              <p className="mt-0.5 text-espresso/70">
                {result.area} · {result.zoneLabel} · {result.feeLabel} delivery
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

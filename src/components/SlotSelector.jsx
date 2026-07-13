import { Clock, AlertCircle } from 'lucide-react'
import {
  getAvailableSlots, isSameDayAvailable, SLOT_CAPACITY,
} from '../data/deliverySlots'

export default function SlotSelector({
  orderType,
  date,
  selectedSlot,
  onSelect,
  error,
}) {
  const slots = date ? getAvailableSlots(date, orderType) : []
  const sameDayOpen = isSameDayAvailable()

  if (orderType === 'same-day' && !sameDayOpen) {
    return (
      <div className="rounded-[var(--radius-sm)] border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <div className="flex items-start gap-2">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Same-day delivery unavailable</p>
            <p className="mt-0.5 text-amber-800/80">
              Orders placed after 2:00 PM qualify for advance booking only. Please switch to Advance Order.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!date) {
    return (
      <p className="text-sm text-espresso/60">Select a date to see available time slots.</p>
    )
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm text-red-700">No slots available for this date. Please choose another date.</p>
    )
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        Time Slot <span className="text-caramel">*</span>
        <span className="ml-2 text-xs font-normal text-espresso/50">
          Max {SLOT_CAPACITY} orders per slot
        </span>
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        {slots.filter((slot) => !slot.disabled || slot.slotsLeft === 0).map((slot) => {
          const full = slot.slotsLeft === 0
          const disabled = slot.disabled || full
          return (
            <button
              key={slot.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(slot.id, slot.label)}
              className={`rounded-[var(--radius-sm)] border-2 px-4 py-3 text-left text-sm transition-colors ${
                selectedSlot === slot.id
                  ? 'border-caramel bg-caramel/10'
                  : disabled
                    ? 'cursor-not-allowed border-blush/50 bg-blush/30 opacity-50'
                    : 'border-blush hover:border-caramel/50'
              }`}
            >
              <span className="flex items-center gap-2 font-medium text-cocoa">
                <Clock size={14} className="text-caramel" />
                {slot.label}
              </span>
              <span className={`mt-1 block text-xs ${full ? 'text-red-600' : 'text-sage'}`}>
                {full ? 'Fully booked' : `${slot.slotsLeft} slot${slot.slotsLeft !== 1 ? 's' : ''} left`}
              </span>
            </button>
          )
        })}
      </div>
      {error && (
        <p className="mt-2 flex items-center gap-1 text-sm text-red-700" role="alert">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  )
}

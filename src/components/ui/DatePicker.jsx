import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default function DatePicker({
  value,
  onChange,
  minLeadDays = 2,
  blackoutDates = [],
  closedWeekdays = [],
  label = 'Select date',
}) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const minDate = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() + minLeadDays)
    return d
  }, [today, minLeadDays])

  const [viewMonth, setViewMonth] = useState(() => {
    const base = value ? parseDateKey(value) : minDate
    return { year: base.getFullYear(), month: base.getMonth() }
  })

  const blackoutSet = useMemo(() => new Set(blackoutDates), [blackoutDates])

  const isDisabled = (year, month, day) => {
    const key = toDateKey(year, month, day)
    const date = new Date(year, month, day)
    date.setHours(0, 0, 0, 0)
    if (date < minDate) return true
    if (closedWeekdays.includes(date.getDay())) return true
    if (blackoutSet.has(key)) return true
    return false
  }

  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate()
  const firstDay = new Date(viewMonth.year, viewMonth.month, 1).getDay()

  const prevMonth = () => {
    setViewMonth((v) => {
      const m = v.month - 1
      return m < 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: m }
    })
  }

  const nextMonth = () => {
    setViewMonth((v) => {
      const m = v.month + 1
      return m > 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: m }
    })
  }

  const selectDay = (day) => {
    if (isDisabled(viewMonth.year, viewMonth.month, day)) return
    onChange(toDateKey(viewMonth.year, viewMonth.month, day))
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="rounded-[var(--radius-md)] border border-blush bg-cream p-4 shadow-warm">
      <p className="mb-3 text-sm font-medium text-cocoa">{label}</p>
      <p className="mb-3 text-xs text-espresso/60">
        Custom cakes need at least {minLeadDays} days advance notice. We are open every day.
      </p>

      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blush text-cocoa hover:bg-caramel hover:text-cream"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-display text-sm text-cocoa">
          {MONTHS[viewMonth.month]} {viewMonth.year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blush text-cocoa hover:bg-caramel hover:text-cream"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1 font-medium text-espresso/50">{w}</span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={`empty-${i}`} />
          const key = toDateKey(viewMonth.year, viewMonth.month, day)
          const disabled = isDisabled(viewMonth.year, viewMonth.month, day)
          const selected = value === key
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => selectDay(day)}
              className={`aspect-square rounded-full text-sm transition-colors ${
                selected
                  ? 'bg-caramel font-semibold text-cream'
                  : disabled
                    ? 'cursor-not-allowed text-espresso/25 line-through'
                    : 'text-cocoa hover:bg-blush'
              }`}
              aria-label={disabled ? `${day} unavailable` : `Select ${key}`}
              aria-pressed={selected}
            >
              {day}
            </button>
          )
        })}
      </div>

      {value && (
        <p className="mt-3 text-center text-sm text-caramel">
          Selected: {parseDateKey(value).toLocaleDateString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>
      )}
    </div>
  )
}

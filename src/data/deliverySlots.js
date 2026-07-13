export const SLOT_CAPACITY = 5
export const SAME_DAY_CUTOFF_HOUR = 14 // 2 PM

export const SAME_DAY_SLOTS = [
  { id: 'sd-1', label: '2:00 PM – 4:00 PM', startHour: 14 },
  { id: 'sd-2', label: '4:00 PM – 6:00 PM', startHour: 16 },
  { id: 'sd-3', label: '6:00 PM – 8:00 PM', startHour: 18 },
]

export const ADVANCE_SLOTS = [
  { id: 'adv-1', label: '9:00 AM – 11:00 AM' },
  { id: 'adv-2', label: '11:00 AM – 1:00 PM' },
  { id: 'adv-3', label: '1:00 PM – 3:00 PM' },
  { id: 'adv-4', label: '3:00 PM – 5:00 PM' },
  { id: 'adv-5', label: '5:00 PM – 7:00 PM' },
]

const BOOKINGS_KEY = 'ss-slot-bookings'

/** Demo seed — simulates existing bookings per date/slot */
const DEMO_BOOKINGS = {
  'sd-1': 2,
  'sd-2': 5,
  'adv-1': 1,
  'adv-3': 4,
  'adv-5': 3,
}

function loadBookings() {
  try {
    const raw = sessionStorage.getItem(BOOKINGS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveBookings(data) {
  sessionStorage.setItem(BOOKINGS_KEY, JSON.stringify(data))
}

function getBookingCount(date, slotId) {
  const bookings = loadBookings()
  const key = `${date}:${slotId}`
  const stored = bookings[key] ?? 0
  const demo = date ? (DEMO_BOOKINGS[slotId] ?? 0) : 0
  return Math.max(stored, demo)
}

export function isSameDayAvailable(now = new Date()) {
  return now.getHours() < SAME_DAY_CUTOFF_HOUR
}

export function getSlotAvailability(date, slotId) {
  const booked = getBookingCount(date, slotId)
  const slotsLeft = Math.max(0, SLOT_CAPACITY - booked)
  return {
    booked,
    slotsLeft,
    capacity: SLOT_CAPACITY,
    available: slotsLeft > 0,
  }
}

export function getAvailableSlots(date, orderType, now = new Date()) {
  const slots = orderType === 'same-day' ? SAME_DAY_SLOTS : ADVANCE_SLOTS
  const isToday = date === formatDateKey(now)

  return slots.map((slot) => {
    const availability = getSlotAvailability(date, slot.id)
    let disabled = !availability.available

    if (orderType === 'same-day' && isToday && slot.startHour !== undefined) {
      if (now.getHours() >= slot.startHour) disabled = true
    }

    return { ...slot, ...availability, disabled }
  })
}

export function bookSlot(date, slotId) {
  const bookings = loadBookings()
  const key = `${date}:${slotId}`
  const current = bookings[key] ?? getBookingCount(date, slotId)
  if (current >= SLOT_CAPACITY) return false
  bookings[key] = current + 1
  saveBookings(bookings)
  return true
}

export function formatDateKey(date) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getTodayKey() {
  return formatDateKey(new Date())
}

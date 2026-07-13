export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
}

export function isValidPhone(phone) {
  return /^[\d\s\-+().]{10,}$/.test(String(phone || '').trim())
}

export function isValidPincode(pincode) {
  return /^\d{6}$/.test(String(pincode || '').trim())
}

export function isRequired(value) {
  return String(value ?? '').trim().length > 0
}

export function minLength(value, min) {
  return String(value ?? '').trim().length >= min
}

export function isValidPassword(password, min = 6) {
  return String(password || '').length >= min
}

export function passwordsMatch(password, confirm) {
  return password === confirm
}

export function isFutureDate(dateStr) {
  if (!dateStr) return false
  const selected = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return selected >= today
}

export function validateRating(rating) {
  const n = Number(rating)
  return Number.isInteger(n) && n >= 1 && n <= 5
}

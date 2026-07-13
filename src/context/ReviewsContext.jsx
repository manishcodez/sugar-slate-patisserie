import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { TESTIMONIALS } from '../data/testimonials'
import { API_ENABLED } from '../config/api'
import { fetchReviewsApi } from '../services/api/reviewsApi'

const STORAGE_KEY = 'ss-user-reviews'
const ReviewsContext = createContext(null)

function loadStoredReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'
}

function mapApiReview(r) {
  return {
    id: r.id,
    name: r.name,
    context: 'Customer Review',
    quote: r.quote,
    rating: r.rating,
    initials: getInitials(r.name),
    photo: r.photo || null,
    isUserSubmitted: true,
    createdAt: r.createdAt,
  }
}

export function ReviewsProvider({ children }) {
  const [userReviews, setUserReviews] = useState(loadStoredReviews)

  const refreshReviews = useCallback(async () => {
    const res = await fetchReviewsApi()
    if (res.ok && Array.isArray(res.data)) {
      setUserReviews(res.data.map(mapApiReview))
      return
    }
    if (!API_ENABLED) setUserReviews(loadStoredReviews())
  }, [])

  useEffect(() => {
    refreshReviews()
  }, [refreshReviews])

  useEffect(() => {
    if (!API_ENABLED) localStorage.setItem(STORAGE_KEY, JSON.stringify(userReviews))
  }, [userReviews])

  const addReview = useCallback((review) => {
    const mapped = review.id ? mapApiReview(review) : {
      id: `user-${Date.now()}`,
      name: review.name.trim(),
      context: 'Customer Review',
      quote: review.quote.trim(),
      rating: review.rating,
      initials: getInitials(review.name),
      photo: review.photo || null,
      isUserSubmitted: true,
      createdAt: new Date().toISOString(),
    }
    setUserReviews((prev) => [mapped, ...prev.filter((r) => r.id !== mapped.id)])
    return mapped
  }, [])

  const allReviews = useMemo(
    () => [...userReviews, ...TESTIMONIALS],
    [userReviews],
  )

  const value = useMemo(
    () => ({ userReviews, allReviews, addReview, refreshReviews }),
    [userReviews, allReviews, addReview, refreshReviews],
  )

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>
}

export function useReviews() {
  const ctx = useContext(ReviewsContext)
  if (!ctx) throw new Error('useReviews must be used within ReviewsProvider')
  return ctx
}

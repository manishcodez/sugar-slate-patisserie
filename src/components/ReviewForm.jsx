import { useState } from 'react'
import { Star, Camera, X, Loader2 } from 'lucide-react'
import { useReviews } from '../context/ReviewsContext'
import { submitReviewApi } from '../services/api/reviewsApi'
import { isRequired, validateRating } from '../utils/validation'
import Button from './ui/Button'

const MAX_QUOTE = 300

function StarPicker({ rating, onChange }) {
  return (
    <div className="flex gap-1" role="group" aria-label="Rate your experience">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            size={24}
            className={star <= rating ? 'fill-caramel text-caramel' : 'text-blush'}
          />
        </button>
      ))}
    </div>
  )
}

export default function ReviewForm() {
  const { addReview, refreshReviews } = useReviews()
  const [name, setName] = useState('')
  const [quote, setQuote] = useState('')
  const [rating, setRating] = useState(5)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('Photo must be under 3 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoPreview(reader.result)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => setPhotoPreview(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isRequired(name)) { setError('Please enter your name'); return }
    if (!isRequired(quote)) { setError('Please write your review'); return }
    if (!validateRating(rating)) { setError('Please select a rating'); return }

    setLoading(true)
    const payload = { name: name.trim(), quote: quote.trim(), rating, photo: photoPreview }
    const res = await submitReviewApi(payload)
    setLoading(false)

    if (res.offline || !res.ok) {
      addReview(payload)
    } else {
      await refreshReviews()
    }

    if (res.ok || res.offline) {
      setSubmitted(true)
      setName('')
      setQuote('')
      setRating(5)
      setPhotoPreview(null)
      setError('')
      setTimeout(() => setSubmitted(false), 4000)
    } else {
      setError(res.error || 'Failed to submit review')
    }
  }

  return (
    <div className="mt-10 rounded-[var(--radius-lg)] border border-blush bg-cream/80 p-6 shadow-warm md:p-8">
      <h3 className="mb-1 font-display text-xl text-cocoa">Share Your Experience</h3>
      <p className="mb-5 text-sm text-espresso/70">
        Loved our cakes? Leave a review with a star rating and optional photo.
      </p>

      {submitted ? (
        <p className="rounded-[var(--radius-sm)] bg-sage/15 px-4 py-3 text-center text-sm font-medium text-sage">
          Thank you! Your review has been added.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Your Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-2.5 outline-none focus:border-caramel"
                placeholder="Priya S."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Rating *</label>
              <StarPicker rating={rating} onChange={setRating} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Your Review * <span className="text-espresso/50">({quote.length}/{MAX_QUOTE})</span>
            </label>
            <textarea
              rows={3}
              maxLength={MAX_QUOTE}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Tell us about your celebration cake experience..."
              className="w-full rounded-[var(--radius-sm)] border border-blush bg-cream px-4 py-2.5 outline-none focus:border-caramel"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Photo (optional)</label>
            {photoPreview ? (
              <div className="flex items-center gap-3">
                <img src={photoPreview} alt="Review preview" className="h-16 w-16 rounded-[var(--radius-sm)] object-cover" />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="flex items-center gap-1 text-sm text-red-700 hover:underline"
                >
                  <X size={14} /> Remove
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-dashed border-caramel/50 bg-caramel/5 px-4 py-3 text-sm text-cocoa transition-colors hover:bg-caramel/10">
                <Camera size={18} className="text-caramel" />
                Upload a photo of your cake (JPG/PNG, max 3 MB)
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handlePhoto} />
              </label>
            )}
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <Button type="submit" magnetic disabled={loading}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : 'Submit Review'}
          </Button>
        </form>
      )}
    </div>
  )
}

import { useState, useCallback } from 'react'

/**
 * Reusable form submission state for API-connected forms.
 * @param {Function} submitFn - async (values) => { ok, error?, data? }
 */
export function useFormSubmit(submitFn) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [data, setData] = useState(null)

  const reset = useCallback(() => {
    setError('')
    setSuccess('')
    setData(null)
  }, [])

  const submit = useCallback(async (values) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const result = await submitFn(values)
      if (result?.ok) {
        setData(result.data ?? null)
        setSuccess(result.message || 'Success!')
        return result
      }
      const msg = result?.error || 'Something went wrong. Please try again.'
      setError(msg)
      return result
    } catch (err) {
      const msg = err?.message || 'Network error. Please try again.'
      setError(msg)
      return { ok: false, error: msg }
    } finally {
      setLoading(false)
    }
  }, [submitFn])

  return { loading, error, success, data, submit, reset, setError, setSuccess }
}

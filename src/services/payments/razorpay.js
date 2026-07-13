const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

export function loadRazorpayScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay is only available in the browser'))
  }
  if (window.Razorpay) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')))
      return
    }

    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'))
    document.body.appendChild(script)
  })
}

/**
 * Opens Razorpay checkout modal.
 * @returns {Promise<object>} Resolves with Razorpay payment response on success.
 */
export function openRazorpayCheckout({
  key,
  orderId,
  amount,
  currency = 'INR',
  name,
  email,
  phone,
}) {
  return new Promise(async (resolve, reject) => {
    try {
      await loadRazorpayScript()
    } catch (err) {
      reject(err)
      return
    }

    const options = {
      key,
      amount,
      currency,
      order_id: orderId,
      name: 'Sugar & Slate',
      description: 'Patisserie Order',
      prefill: {
        name: name || '',
        email: email || '',
        contact: phone || '',
      },
      theme: { color: '#C8956C' },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (response) => {
      reject(new Error(response?.error?.description || 'Payment failed'))
    })
    rzp.open()
  })
}

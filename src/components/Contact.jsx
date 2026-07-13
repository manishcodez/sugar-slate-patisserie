import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Clock, AlertCircle, Navigation, Phone } from 'lucide-react'
import { submitContactApi } from '../services/api/contactApi'
import { BAKERY, FOUNDER, GOOGLE_MAPS_EMBED_URL, GOOGLE_MAPS_DIRECTIONS_URL } from '../data/constants'
import { GitHubIcon, LinkedInIcon } from './ui/SocialIcons'
import PincodeChecker from './PincodeChecker'
import { useCart } from '../context/CartContext'
import { isValidEmail, isValidPhone } from '../utils/validation'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { SectionHeading, ScrollReveal } from './ui/Animations'
import Button from './ui/Button'
import Toast from './ui/Toast'

const SUBJECTS = [
  'Custom Cake Inquiry',
  'General Question',
  'Catering / Corporate',
  'Tasting Session',
  'Feedback',
  'Other',
]

function DevContactCard({ icon: Icon, label, value, href, copyText, onCopied }) {
  const { copied, copy } = useCopyToClipboard()

  const handleCopy = async () => {
    const ok = await copy(copyText || value)
    if (ok) onCopied('Copied!')
  }

  return (
    <motion.div
      className="premium-card group p-5"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-caramel/15 text-caramel">
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-espresso/50">
            {label}
          </p>
          <a
            href={href}
            target={href.startsWith('mailto') || href.startsWith('tel') ? undefined : '_blank'}
            rel="noopener noreferrer"
            className="mt-1 block break-all text-sm font-medium text-cocoa transition-colors hover:text-caramel"
          >
            {value}
          </a>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-caramel/10 text-caramel transition-colors hover:bg-caramel hover:text-cream"
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
              ✓
            </motion.span>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
        </button>
      </div>
    </motion.div>
  )
}

export default function Contact() {
  const { contactPrefill, setContactPrefill } = useCart()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [submitError, setSubmitError] = useState('')
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  useEffect(() => {
    if (contactPrefill) {
      setForm((prev) => ({ ...prev, message: contactPrefill, subject: 'Custom Cake Inquiry' }))
      setContactPrefill('')
    }
  }, [contactPrefill, setContactPrefill])

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!isValidEmail(form.email)) e.email = 'Please enter a valid email'
    if (form.phone && !isValidPhone(form.phone)) e.phone = 'Please enter a valid phone number'
    if (!form.message.trim()) e.message = 'Message is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setStatus('loading')
    setSubmitError('')

    try {
      const res = await submitContactApi({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
      })

      if (!res.ok) {
        throw new Error(res.error || 'Failed to send message. Please try again.')
      }

      setStatus('success')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      setStatus('error')
      setSubmitError(err.message || 'Something went wrong. Please try again later.')
    }
  }

  const bakeryCards = [
    ...(BAKERY.phone
      ? [{ icon: Phone, label: 'Phone', value: BAKERY.phone, href: `tel:${BAKERY.phone.replace(/\s/g, '')}`, copyText: BAKERY.phone, isLucide: true }]
      : []),
    { icon: Mail, label: 'Email', value: BAKERY.email, href: `mailto:${BAKERY.email}`, copyText: BAKERY.email, isLucide: true },
    { icon: MapPin, label: 'Studio', value: 'Mirzamurad, Varanasi', href: GOOGLE_MAPS_DIRECTIONS_URL, copyText: BAKERY.address, isLucide: true },
  ]

  const founderCards = [
    { icon: Mail, label: 'Email', value: FOUNDER.email, href: `mailto:${FOUNDER.email}`, copyText: FOUNDER.email, isLucide: true },
    { icon: GitHubIcon, label: 'GitHub', value: 'CodeWithRupanjali', href: FOUNDER.github, copyText: FOUNDER.github, isLucide: false },
    { icon: LinkedInIcon, label: 'LinkedIn', value: 'Rupanjali Kumari', href: FOUNDER.linkedin, copyText: FOUNDER.linkedin, isLucide: false },
  ]

  return (
    <section id="contact" className="section-padding bg-blush grain-overlay relative">
      <div className="section-container">
        <SectionHeading
          eyebrow="Let's Create Something Sweet Together"
          title="Get in Touch"
          subtitle="Whether you're planning a Varanasi wedding, corporate event, or an intimate celebration — we'd love to hear from you."
        />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-1 block text-sm font-medium">
                    Name <span className="text-caramel">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    className="form-input"
                    aria-required="true"
                  />
                  {errors.name && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-700" role="alert">
                      <AlertCircle size={14} />{errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-1 block text-sm font-medium">
                    Email <span className="text-caramel">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="form-input"
                    aria-required="true"
                  />
                  {errors.email && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-700" role="alert">
                      <AlertCircle size={14} />{errors.email}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-phone" className="mb-1 block text-sm font-medium">Phone</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className="form-input"
                  />
                  {errors.phone && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-700" role="alert">
                      <AlertCircle size={14} />{errors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="contact-subject" className="mb-1 block text-sm font-medium">Subject</label>
                  <select
                    id="contact-subject"
                    value={form.subject}
                    onChange={(e) => update('subject', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select a reason</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-1 block text-sm font-medium">
                  Message <span className="text-caramel">*</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  className="form-input resize-y"
                  aria-required="true"
                />
                {errors.message && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-red-700" role="alert">
                    <AlertCircle size={14} />{errors.message}
                  </p>
                )}
              </div>

              <div aria-live="polite">
                {status === 'success' && (
                  <motion.div
                    className="mb-4 flex items-center gap-3 rounded-[var(--radius-sm)] border border-sage/30 bg-sage/10 px-4 py-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/20 text-sage">✓</span>
                    <p className="text-sm font-medium text-espresso">
                      Thank you! Your message has been sent. We'll respond within 24 hours.
                    </p>
                  </motion.div>
                )}
                {status === 'error' && submitError && (
                  <motion.div
                    className="mb-4 flex items-center gap-3 rounded-[var(--radius-sm)] border border-red-200 bg-red-50 px-4 py-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                  >
                    <AlertCircle size={18} className="shrink-0 text-red-600" />
                    <p className="text-sm text-red-700">{submitError}</p>
                  </motion.div>
                )}
              </div>

              <Button type="submit" magnetic disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.1}>
            <div className="space-y-6">
              <PincodeChecker />

              <div className="premium-card overflow-hidden p-6">
                <h3 className="font-display text-xl text-cocoa mb-4">Visit Our Studio</h3>
                <div className="space-y-3 text-sm text-espresso/80">
                  <p className="flex items-start gap-3">
                    <MapPin size={18} className="shrink-0 text-caramel mt-0.5" />
                    <span className="min-w-0 break-words">{BAKERY.address}</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <Clock size={18} className="shrink-0 text-caramel mt-0.5" />
                    {BAKERY.hours}
                  </p>
                </div>
                <div className="mt-4 overflow-hidden rounded-[var(--radius-md)] ring-1 ring-blush/60">
                  <iframe
                    title="Sugar & Slate Patisserie location on Google Maps — Mirzamurad, Varanasi"
                    src={GOOGLE_MAPS_EMBED_URL}
                    className="h-52 w-full border-0 md:h-56"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <Button
                  href={GOOGLE_MAPS_DIRECTIONS_URL}
                  variant="secondary"
                  className="mt-3 w-full flex items-center justify-center gap-2"
                  magnetic
                >
                  <Navigation size={16} /> Get Directions
                </Button>
              </div>

              <div>
                <h3 className="font-display text-lg text-cocoa mb-1">
                  <span className="script-accent text-2xl">{FOUNDER.name}</span>
                </h3>
                <p className="mb-3 text-sm text-espresso/70">
                  {FOUNDER.title} · {FOUNDER.brand}
                </p>
                <div className="space-y-3">
                  {founderCards.map((card) => (
                    <DevContactCard key={card.label} {...card} onCopied={showToast} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display text-lg text-cocoa mb-3">
                  <span className="script-accent text-2xl">Reach</span> Our Studio
                </h3>
                <div className="space-y-3">
                  {bakeryCards.map((card) => (
                    <DevContactCard key={card.label} {...card} onCopied={showToast} />
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
      <Toast message={toast} visible={!!toast} />
    </section>
  )
}

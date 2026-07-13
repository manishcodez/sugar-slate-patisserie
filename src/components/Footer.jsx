import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Clock, ArrowRight, Loader2 } from 'lucide-react'
import { BAKERY, NAV_LINKS } from '../data/constants'
import { isValidEmail } from '../utils/validation'
import { subscribeNewsletterApi } from '../services/api/newsletterApi'
import { FacebookIcon, PinterestIcon, InstagramIcon } from './ui/SocialIcons'

const bakerySocial = [
  { icon: InstagramIcon, href: BAKERY.social.instagram, label: 'Instagram' },
  { icon: FacebookIcon, href: BAKERY.social.facebook, label: 'Facebook' },
  { icon: PinterestIcon, href: BAKERY.social.pinterest, label: 'Pinterest' },
].filter((s) => s.href?.trim())

function FooterNewsletter() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setError('Please enter a valid email')
      return
    }
    setError('')
    setLoading(true)
    const res = await subscribeNewsletterApi(email)
    setLoading(false)
    if (res.ok) {
      setSuccess(res.message || "You're subscribed!")
      setEmail('')
      setTimeout(() => setSuccess(''), 4000)
    } else {
      setError(res.error || 'Subscription failed')
    }
  }

  return (
    <div className="border-b border-cream/10 pb-10">
      <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
        <div className="flex-1">
          <p className="script-accent text-2xl text-champagne">Stay in the Loop</p>
          <p className="mt-2 text-sm text-cream/90">
            Seasonal flavours, limited editions & exclusive offers — delivered to your inbox.
          </p>
        </div>
        {success ? (
          <motion.p
            className="text-sm font-medium text-champagne"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✓ {success}
          </motion.p>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-stretch">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="your@email.com"
              className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-cream/30 bg-cream/15 px-4 py-2.5 text-sm text-cream placeholder:text-cream/50 outline-none focus:border-champagne"
              aria-label="Newsletter email"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-caramel px-5 py-2.5 text-sm font-semibold text-cream transition-all hover:bg-champagne hover:text-espresso disabled:opacity-60"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <>Subscribe <ArrowRight size={14} /></>}
            </button>
          </form>
        )}
      </div>
      {error && <p className="mt-2 text-center text-xs text-rose md:text-right" role="alert">{error}</p>}
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-espresso text-cream">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(240,168,192,0.2) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="section-container relative z-10 section-padding mx-auto">
        <FooterNewsletter />

        <div className="grid gap-8 border-t border-cream/10 pt-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-4 lg:pt-10">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] bg-caramel/20 font-display text-sm font-semibold text-champagne ring-1 ring-champagne/30">
                S&S
              </span>
              <div>
                <span className="font-display text-lg text-cream">Sugar & Slate</span>
                <p className="text-[10px] uppercase tracking-[0.2em] text-cream/80">Patisserie</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-cream/90">
              {BAKERY.tagline}
            </p>
            <div className="mt-5 flex gap-2.5">
              {bakerySocial.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-cream/70 ring-1 ring-cream/10 transition-all duration-300 hover:bg-caramel hover:text-cream hover:ring-caramel hover:shadow-glow hover:scale-110"
                >
                  <Icon size={17} className="transition-transform group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-cream/90">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex items-center gap-1 transition-colors hover:text-champagne"
                  >
                    <span className="h-px w-0 bg-champagne transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Visit Us</h4>
            <ul className="space-y-3 text-sm text-cream/90">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-champagne" />
                <span className="min-w-0 break-words">{BAKERY.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock size={16} className="mt-0.5 shrink-0 text-champagne" />
                <span>{BAKERY.hours}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Contact</h4>
            <ul className="space-y-3 text-sm text-cream/90">
              <li className="flex items-start gap-2.5">
                <Mail size={16} className="mt-0.5 shrink-0 text-champagne" />
                <a href={`mailto:${BAKERY.email}`} className="min-w-0 break-all transition-colors hover:text-champagne">
                  {BAKERY.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock size={16} className="mt-0.5 shrink-0 text-champagne" />
                <span>{BAKERY.hours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-cream/15">
        <div className="section-container mx-auto px-5 py-6 text-center text-sm text-cream/80 md:px-8">
          <p>© 2026 Sugar & Slate Patisserie. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

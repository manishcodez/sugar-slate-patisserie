import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingBag, User } from 'lucide-react'
import { NAV_LINKS } from '../data/constants'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useCustomerPortal } from '../context/CustomerPortalContext'
import { useFocusTrap, useScrollLock } from '../hooks/useFocusTrap'
import Button from './ui/Button'
import CartDrawer from './cart/CartDrawer'
import UserMenu from './auth/UserMenu'
import AuthModal from './auth/AuthModal'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState('login')
  const { itemCount, setIsOpen, cartPulse } = useCart()
  const { user, ready } = useAuth()
  const { openPortal } = useCustomerPortal()

  const openLogin = () => {
    setAuthTab('login')
    setAuthOpen(true)
  }

  const openSignup = () => {
    setAuthTab('signup')
    setAuthOpen(true)
  }
  const drawerRef = useFocusTrap(mobileOpen)
  useScrollLock(mobileOpen)

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const onHashChange = () => setMobileOpen(false)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [mobileOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const openAuth = () => openLogin()
    window.addEventListener('ss-open-auth', openAuth)
    return () => window.removeEventListener('ss-open-auth', openAuth)
  }, [])

  useEffect(() => {
    const hash = window.location.hash
    if (!hash.startsWith('#reset-password')) return
    const query = hash.split('?')[1]
    if (!query) return
    const params = new URLSearchParams(query)
    const token = params.get('token')
    const email = params.get('email')
    if (token && email) {
      window.dispatchEvent(new CustomEvent('ss-reset-password', { detail: { token, email } }))
      setAuthTab('reset')
      setAuthOpen(true)
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    }
  }, [])

  const onHero = !scrolled

  const headerBg = scrolled
    ? 'bg-cream shadow-warm border-b border-rose/30'
    : 'header-hero-mode bg-espresso/72 backdrop-blur-md border-b border-cream/15'

  const logoBadgeClass = onHero
    ? 'bg-cream/20 text-cream group-hover:bg-cream group-hover:text-cocoa'
    : 'bg-caramel/15 text-cocoa group-hover:bg-caramel group-hover:text-cream'

  const logoTextClass = onHero ? 'text-cream' : 'text-cocoa'

  const iconBtnClass = onHero
    ? 'bg-cream/20 text-cream hover:bg-cream hover:text-cocoa'
    : 'bg-caramel/10 text-cocoa hover:bg-caramel hover:text-cream'

  const menuIconClass = onHero ? 'text-cream' : 'text-cocoa'

  const loginOutlineClass = onHero
    ? 'rounded-full border-2 border-cream/70 bg-cream/5 text-cream hover:border-cream hover:bg-cream/15'
    : 'rounded-full border-2 border-caramel/50 bg-transparent text-cocoa hover:border-caramel hover:bg-caramel/10'

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[90] pt-[env(safe-area-inset-top)] transition-all duration-300 ease-[var(--ease-premium)] ${headerBg}`}
      >
        <div className="section-container mx-auto flex h-14 min-w-0 items-center gap-2 px-3 sm:px-4 md:h-[64px] md:px-6 lg:gap-4 lg:px-8">
          {/* Brand zone */}
          <a href="#home" className="group flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] font-display text-sm font-semibold transition-colors lg:h-10 lg:w-10 ${logoBadgeClass}`}>
              S&S
            </span>
            <span className={`hidden truncate font-display text-base font-semibold transition-colors duration-300 min-[380px]:inline md:text-lg lg:text-xl ${logoTextClass}`}>
              Sugar & Slate
            </span>
          </a>

          {/* Menu zone — centred on laptop */}
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 lg:flex xl:gap-6" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`header-nav-link relative whitespace-nowrap text-[15px] font-medium tracking-wide transition-colors after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-0 after:-translate-x-1/2 after:bg-champagne after:transition-all after:duration-300 hover:after:w-full xl:text-base ${
                  onHero
                    ? 'text-cream hover:text-champagne'
                    : 'text-espresso hover:text-caramel'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Account + cart zone */}
          <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
            {ready && !user && (
              <>
                <div
                  className={`hidden h-8 w-px sm:block ${onHero ? 'bg-cream/30' : 'bg-espresso/15'}`}
                  aria-hidden="true"
                />
                <div
                  className={`header-auth-group hidden items-center gap-2 rounded-full p-1 sm:flex ${
                    onHero ? 'bg-cream/10' : 'bg-blush/60'
                  }`}
                >
                  <button
                    type="button"
                    onClick={openLogin}
                    className={`px-4 py-2 text-[15px] font-semibold transition-all xl:px-5 xl:text-base ${loginOutlineClass}`}
                  >
                    Login
                  </button>
                  <Button
                    size="sm"
                    onClick={openSignup}
                    magnetic
                    className="!rounded-full !px-5 !py-2 !text-[15px] shadow-glow xl:!px-6 xl:!text-base"
                  >
                    Sign Up
                  </Button>
                </div>
              </>
            )}

            <UserMenu />

            <motion.button
              type="button"
              onClick={() => setIsOpen(true)}
              className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors md:h-10 md:w-10 ${iconBtnClass}`}
              aria-label={`Open cart, ${itemCount} items`}
              animate={cartPulse ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              <ShoppingBag size={18} />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-caramel px-0.5 text-[9px] font-bold text-cream"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <button
              type="button"
              className={`flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-[var(--radius-sm)] lg:hidden ${menuIconClass}`}
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              ref={drawerRef}
              id="mobile-navigation"
              className="fixed inset-0 z-[250] flex lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                type="button"
                className="min-w-0 flex-1 touch-manipulation bg-espresso/50"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              />
              <motion.aside
                className="flex h-full w-[min(88vw,320px)] max-w-full flex-col bg-cream shadow-luxury"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              >
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-blush px-4">
                  <span className="font-display text-base font-semibold text-cocoa">
                    Menu
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="flex h-9 w-9 touch-manipulation items-center justify-center rounded-full bg-blush text-cocoa"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>
                <nav
                  className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-3 py-3"
                  aria-label="Mobile navigation"
                >
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-[var(--radius-sm)] px-3 py-3 font-display text-base text-cocoa transition-colors active:bg-blush active:text-caramel"
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="mt-3 flex flex-col gap-2 border-t border-blush pt-4">
                    <Button
                      href="#custom-cakes"
                      onClick={() => setMobileOpen(false)}
                      className="w-full !py-2.5 !text-sm"
                    >
                      Order Now
                    </Button>
                    {ready && user ? (
                      <Button
                        variant="secondary"
                        className="w-full !py-2.5 !text-sm"
                        onClick={() => {
                          setMobileOpen(false)
                          openPortal('dashboard')
                        }}
                      >
                        <User size={16} className="mr-2 inline" />
                        My Account
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="flex-1 !py-2.5 !text-sm"
                          onClick={() => {
                            setMobileOpen(false)
                            openLogin()
                          }}
                        >
                          Login
                        </Button>
                        <Button
                          className="flex-1 !py-2.5 !text-sm"
                          onClick={() => {
                            setMobileOpen(false)
                            openSignup()
                          }}
                        >
                          Sign Up
                        </Button>
                      </div>
                    )}
                  </div>
                </nav>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialTab={authTab} />
      <CartDrawer />
    </>
  )
}

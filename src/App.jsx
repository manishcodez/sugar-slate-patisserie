import { useState, useEffect, lazy, Suspense } from 'react'
import { CartProvider } from './context/CartContext'
import { ShopProvider } from './context/ShopContext'
import { ReviewsProvider } from './context/ReviewsContext'
import { LoyaltyProvider } from './context/LoyaltyContext'
import { ProductsProvider } from './context/ProductsContext'
import { NotificationProvider } from './context/NotificationContext'
import { AuthProvider } from './context/AuthContext'
import { CustomerPortalProvider } from './context/CustomerPortalContext'
import { OrdersProvider } from './context/OrdersContext'
import Preloader from './components/Preloader'
import ScrollProgress from './components/ScrollProgress'
import Header from './components/Header'
import Hero from './components/Hero'
import CategoryGrid from './components/CategoryGrid'
import BestsellerStrip from './components/BestsellerStrip'
import About from './components/About'
import Menu from './components/Menu'
import Blog from './components/Blog'
import CustomerCelebrations from './components/CustomerCelebrations'
import Testimonials from './components/Testimonials'
import MyRewards from './components/MyRewards'
import FAQ from './components/FAQ'
import Contact from './components/Contact'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import CheckoutFlow from './components/cart/CheckoutFlow'
import CustomerPortal from './components/customer/CustomerPortal'

const CakeBuilder = lazy(() => import('./components/CakeBuilder'))
const Gallery = lazy(() => import('./components/Gallery'))
const AdminPanel = lazy(() => import('./components/admin/AdminPanel'))

function SectionSkeleton() {
  return (
    <div className="section-padding">
      <div className="section-container mx-auto h-64 animate-pulse rounded-[var(--radius-lg)] bg-blush/60" />
    </div>
  )
}

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [ownerDashboard, setOwnerDashboard] = useState(
    () => typeof window !== 'undefined' && window.location.hash === '#admin',
  )

  useEffect(() => {
    const sync = () => {
      setOwnerDashboard(window.location.hash === '#admin')
      if (window.location.hash === '#admin') {
        window.scrollTo(0, 0)
      }
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  return (
    <AuthProvider>
      <NotificationProvider>
        <OrdersProvider>
          <CustomerPortalProvider>
            <ProductsProvider>
              <CartProvider>
                <ShopProvider>
                  <ReviewsProvider>
                    <LoyaltyProvider>
                  {!loaded && <Preloader onComplete={() => setLoaded(true)} />}
                  {ownerDashboard ? (
                    <Suspense fallback={
                      <div className="flex min-h-screen items-center justify-center bg-cream text-espresso/50">
                        Loading dashboard…
                      </div>
                    }>
                      <AdminPanel />
                    </Suspense>
                  ) : (
                    <>
                      <a href="#main-content" className="skip-link">
                        Skip to content
                      </a>
                      <ScrollProgress />
                      <Header />
                      <main id="main-content">
                        <Hero />
                        <CategoryGrid />
                        <BestsellerStrip />
                        <About />
                        <Menu />
                        <Blog />
                        <Suspense fallback={<SectionSkeleton />}>
                          <CakeBuilder />
                        </Suspense>
                        <Suspense fallback={<SectionSkeleton />}>
                          <Gallery />
                        </Suspense>
                        <CustomerCelebrations />
                        <Testimonials />
                        <MyRewards />
                        <FAQ />
                        <Contact />
                      </main>
                      <Footer />
                      <BackToTop />
                    </>
                  )}
                  <CheckoutFlow />
                  <CustomerPortal />
                </LoyaltyProvider>
              </ReviewsProvider>
            </ShopProvider>
          </CartProvider>
        </ProductsProvider>
          </CustomerPortalProvider>
        </OrdersProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

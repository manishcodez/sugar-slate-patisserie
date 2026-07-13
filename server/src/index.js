import 'dotenv/config'
import express from 'express'

const app = express()
const PORT = Number(process.env.PORT) || 3000

function health(_req, res) {
  res.status(200).json({ ok: true, service: 'sugar-slate-api', time: new Date().toISOString() })
}

app.get('/', health)
app.get('/api/health', health)

app.listen(PORT, () => {
  console.log(`[bootstrap] health check live on port ${PORT}`)
  loadApplication(app).catch((err) => {
    console.error('[fatal] failed to load application:', err)
    process.exit(1)
  })
})

async function loadApplication(app) {
  console.log('[startup] loading routes and database...')

  const [
    { initDatabase },
    { default: cors },
    { default: authRoutes },
    { default: ordersRoutes },
    { default: checkoutRoutes },
    { default: addressesRoutes },
    { default: wishlistRoutes },
    { default: notificationsRoutes },
    { default: reviewsRoutes },
    { default: contactRoutes },
    { default: feedbackRoutes },
    { default: newsletterRoutes },
    { default: customCakesRoutes },
    { default: adminRoutes },
    { default: productsRoutes },
    { default: loyaltyRoutes },
    { default: paymentsRoutes },
  ] = await Promise.all([
    import('./db.js'),
    import('cors'),
    import('./routes/auth.js'),
    import('./routes/orders.js'),
    import('./routes/checkout.js'),
    import('./routes/addresses.js'),
    import('./routes/wishlist.js'),
    import('./routes/notifications.js'),
    import('./routes/reviews.js'),
    import('./routes/contact.js'),
    import('./routes/feedback.js'),
    import('./routes/newsletter.js'),
    import('./routes/customCakes.js'),
    import('./routes/admin.js'),
    import('./routes/products.js'),
    import('./routes/loyalty.js'),
    import('./routes/payments.js'),
  ])

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('change-this')) {
    console.warn('[security] WARNING: Set a strong JWT_SECRET in server/.env before production!')
  }

  const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

  app.use(cors({
    origin: CLIENT_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  }))
  app.use(express.json({ limit: '10mb' }))

  app.use('/api/auth', authRoutes)
  app.use('/api/orders', ordersRoutes)
  app.use('/api/checkout', checkoutRoutes)
  app.use('/api/addresses', addressesRoutes)
  app.use('/api/wishlist', wishlistRoutes)
  app.use('/api/notifications', notificationsRoutes)
  app.use('/api/reviews', reviewsRoutes)
  app.use('/api/contact', contactRoutes)
  app.use('/api/feedback', feedbackRoutes)
  app.use('/api/newsletter', newsletterRoutes)
  app.use('/api/custom-cakes', customCakesRoutes)
  app.use('/api/products', productsRoutes)
  app.use('/api/loyalty', loyaltyRoutes)
  app.use('/api/payments', paymentsRoutes)
  app.use('/api/admin', adminRoutes)

  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  })

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' })
  })

  console.log('[startup] initializing database...')
  initDatabase()
  console.log('[startup] database ready')
  console.log(`Sugar & Slate API fully ready on port ${PORT}`)
}

process.on('uncaughtException', (err) => {
  console.error('[fatal] uncaught exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('[fatal] unhandled rejection:', reason)
  process.exit(1)
})

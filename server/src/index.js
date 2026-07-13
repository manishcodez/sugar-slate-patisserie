import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { initDatabase } from './db.js'
import authRoutes from './routes/auth.js'
import ordersRoutes from './routes/orders.js'
import checkoutRoutes from './routes/checkout.js'
import addressesRoutes from './routes/addresses.js'
import wishlistRoutes from './routes/wishlist.js'
import notificationsRoutes from './routes/notifications.js'
import reviewsRoutes from './routes/reviews.js'
import contactRoutes from './routes/contact.js'
import feedbackRoutes from './routes/feedback.js'
import newsletterRoutes from './routes/newsletter.js'
import customCakesRoutes from './routes/customCakes.js'
import adminRoutes from './routes/admin.js'
import productsRoutes from './routes/products.js'
import loyaltyRoutes from './routes/loyalty.js'
import paymentsRoutes from './routes/payments.js'

initDatabase()

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('change-this')) {
  console.warn('[security] WARNING: Set a strong JWT_SECRET in server/.env before production!')
}

const app = express()
const PORT = Number(process.env.PORT) || 3000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(cors({
  origin: CLIENT_ORIGIN.split(',').map((s) => s.trim()),
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'sugar-slate-api', time: new Date().toISOString() })
})

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

app.listen(PORT, () => {
  console.log(`Sugar & Slate API running at http://localhost:${PORT}/api`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})

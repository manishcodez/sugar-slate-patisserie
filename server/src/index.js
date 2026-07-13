import 'dotenv/config'
import http from 'node:http'
import express from 'express'

const PORT = Number(process.env.PORT) || 3000
const app = express()

function health(_req, res) {
  res.status(200).json({ ok: true, service: 'sugar-slate-api', time: new Date().toISOString() })
}

app.get('/', health)
app.get('/api/health', health)

const server = http.createServer(app)

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[bootstrap] health check live on 0.0.0.0:${PORT}`)
  import('./app.js').then(async ({ createApp }) => {
    const mainApp = await createApp()
    server.removeAllListeners('request')
    server.on('request', (req, res) => mainApp(req, res))
    console.log('[startup] express routes mounted')
    const { initDatabase } = await import('./db.js')
    console.log('[startup] initializing database...')
    initDatabase()
    console.log('[startup] database ready')
  }).catch((err) => {
    console.error('[fatal] failed to load application:', err)
    process.exit(1)
  })
})

process.on('uncaughtException', (err) => {
  console.error('[fatal] uncaught exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('[fatal] unhandled rejection:', reason)
  process.exit(1)
})

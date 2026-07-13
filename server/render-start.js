import http from 'node:http'

const PORT = Number(process.env.PORT) || 3000
let appHandler = null

const server = http.createServer((req, res) => {
  const path = (req.url || '/').split('?')[0]

  if (path === '/' || path === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, service: 'sugar-slate-api' }))
    return
  }

  if (appHandler) {
    appHandler(req, res)
    return
  }

  res.writeHead(503, { 'Content-Type': 'text/plain' })
  res.end('starting')
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[render-start] health server listening on 0.0.0.0:${PORT}`)
  import('./src/app.js').then(async ({ createApp }) => {
    const app = await createApp()
    appHandler = (req, res) => app(req, res)
    console.log('[render-start] express app ready')
    const { initDatabase } = await import('./src/db.js')
    console.log('[startup] initializing database...')
    initDatabase()
    console.log('[startup] database ready')
  }).catch((err) => {
    console.error('[render-start] failed to start app:', err)
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

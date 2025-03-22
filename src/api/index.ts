import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

// Import route handlers
import { authRouter } from './routes/auth'

// Create the main app
const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())
app.use('*', prettyJSON())

// Health check
app.get('/', (c) => c.json({ status: 'ok' }))

// Mount routers
app.route('/api/auth', authRouter)

// Error handling
app.onError((err, c) => {
  console.error(`${err}`)
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
  }, 500)
})

export default app 
import { Hono, Context, Next } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { HTTPException } from 'hono/http-exception'
import authRouter from './routes/auth'
import { Env } from './types'

// Create the main app
const app = new Hono<Env>()

// Middleware
app.use('*', logger())
app.use('*', cors())
app.use('*', prettyJSON())

// Health check
app.get('/', (c: Context<Env>) => c.json({ status: 'ok' }))

// Mount routers
app.route('/api/auth', authRouter)

// Error handling
app.use('*', async (_c: Context<Env>, next: Next) => {
  try {
    await next()
  } catch (err) {
    console.error(`${err}`)
    if (err instanceof HTTPException) {
      throw err
    }
    throw new HTTPException(500, {
      message: err instanceof Error ? err.message : 'Unknown error'
    })
  }
})

export default app 
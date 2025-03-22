import { Hono } from 'hono'

const authRouter = new Hono()

authRouter.post('/login', async (c) => {
  return c.json({ message: 'Login endpoint' })
})

authRouter.get('/me', async (c) => {
  return c.json({ message: 'Get current user endpoint' })
})

export { authRouter } 
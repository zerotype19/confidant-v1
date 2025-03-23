import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { Env } from './types';
import authRouter from './routes/auth';
import techniquesRouter from './routes/techniques';
import { setDb } from './db';

const app = new Hono<{ Bindings: Env }>();

// Set up database
app.use('*', async (c, next) => {
  setDb(c.env.DB);
  await next();
});

// CORS middleware
app.use('*', cors({
  origin: ['https://confidant-web.pages.dev'],
  credentials: true,
}));

// JWT middleware
app.use('*', async (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET || 'your-secret-key',
  });
  return jwtMiddleware(c, next);
});

// Health check endpoint
app.get('/health', (c) => c.json({ status: 'ok' }));

// Routes
app.route('/api/auth', authRouter);
app.route('/api/techniques', techniquesRouter);

export default app; 
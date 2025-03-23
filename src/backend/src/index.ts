import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt, verify } from 'hono/jwt';
import { Env } from './types';
import authRouter from './routes/auth';
import techniquesRouter from './routes/techniques';
import childrenRouter from './routes/children';
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

// JWT middleware - exclude OAuth routes and validate endpoint
app.use('*', async (c, next) => {
  // Skip JWT for OAuth routes and validate endpoint
  if (c.req.path.startsWith('/api/auth/google') || c.req.path === '/api/auth/validate') {
    return next();
  }

  // Try to get token from Authorization header first
  let token = c.req.header('Authorization')?.split(' ')[1];
  
  // If no token in header, try to get from cookie
  if (!token) {
    const cookie = c.req.header('cookie');
    if (cookie) {
      token = cookie.split(';')
        .find(c => c.trim().startsWith('auth_token='))
        ?.split('=')[1];
    }
  }

  console.log('Auth Debug:', {
    path: c.req.path,
    hasAuthHeader: !!c.req.header('Authorization'),
    hasCookie: !!c.req.header('cookie'),
    token: token ? 'present' : 'missing'
  });

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Verify the token manually first
    const payload = await verify(token, c.env.JWT_SECRET);
    console.log('Token payload:', payload);

    // Set the verified payload in the context
    c.set('jwtPayload', payload);

    // Continue with the request
    await next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Health check endpoint
app.get('/health', (c) => c.json({ status: 'ok' }));

// Routes
app.route('/api/auth', authRouter);
app.route('/api/techniques', techniquesRouter);
app.route('/api/children', childrenRouter);

export default app; 
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { verifySession } from './auth';
import authRouter from './api/auth';
import { onboardingRouter } from './api/onboarding';
import childrenRouter from './api/children';
import { D1Database } from './types';

interface Bindings {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>();

// Global error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({
    success: false,
    error: err.message
  }, 500);
});

// Configure CORS
app.use('*', cors({
  origin: ['https://confidant-web.pages.dev', 'http://localhost:5173'],
  credentials: true,
}));

// Health check
app.get('/', (c) => c.json({ status: 'ok' }));

// Mount the onboarding routes
app.route('/api/onboarding', onboardingRouter);

// Mount the children routes
app.route('/api/children', childrenRouter);

// Mount the auth routes
app.route('/api/auth', authRouter);

// Default route for SPA
app.get('*', (c) => {
  return c.html(`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Confidant</title>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="/src/main.tsx"></script>
      </body>
    </html>`);
});

export default app; 
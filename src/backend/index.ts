import { Hono } from 'hono';
import onboardingRouter from './api/onboarding';

const app = new Hono();

// API routes
app.route('/api/onboarding', onboardingRouter);

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
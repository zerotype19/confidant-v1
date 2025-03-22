import { Context } from 'hono';
import { getCookie } from 'hono/cookie';

interface UserClaims {
  sub: string;
  email: string;
  name?: string;
  auth_provider: string;
  auth_provider_id: string;
}

export function getClaims(c: Context): UserClaims {
  const claims = c.get('claims');
  if (!claims) {
    throw new Error('No claims found in context');
  }
  return claims as UserClaims;
}

export function verifySession() {
  return async (c: Context, next: () => Promise<void>) => {
    const sessionToken = getCookie(c, 'session');
    
    if (!sessionToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
      // TODO: Implement session verification with your auth provider
      // For now, we'll just parse the JWT and set the claims
      const [, payload] = sessionToken.split('.');
      const claims = JSON.parse(Buffer.from(payload, 'base64').toString());
      
      c.set('claims', claims);
      await next();
    } catch (error) {
      return c.json({ error: 'Invalid session' }, 401);
    }
  };
} 
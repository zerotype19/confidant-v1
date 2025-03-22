import { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { verify } from 'hono/jwt';

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

export const verifySession = async (c: Context, next: () => Promise<void>) => {
  const authToken = getCookie(c, 'auth_token');
  
  if (!authToken) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Verify the JWT token
    const claims = await verify(authToken, 'your-jwt-secret');
    c.set('claims', claims);
    await next();
  } catch (error) {
    console.error('Session verification error:', error);
    return c.json({ error: 'Invalid session' }, 401);
  }
}; 
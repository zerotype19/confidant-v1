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

interface Env {
  JWT_SECRET: string;
}

interface ContextWithClaims extends Context<{ Bindings: Env }> {
  set(key: 'claims', value: UserClaims): void;
  get(key: 'claims'): UserClaims;
}

function isUserClaims(payload: unknown): payload is UserClaims {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  
  return (
    typeof p.sub === 'string' &&
    typeof p.email === 'string' &&
    typeof p.auth_provider === 'string' &&
    typeof p.auth_provider_id === 'string' &&
    (p.name === undefined || typeof p.name === 'string')
  );
}

export function getClaims(c: ContextWithClaims): UserClaims {
  const claims = c.get('claims');
  if (!claims) {
    throw new Error('No claims found in context');
  }
  return claims;
}

export const verifySession = async (c: ContextWithClaims, next: () => Promise<void>) => {
  const authToken = getCookie(c, 'auth_token');
  
  if (!authToken) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Verify the JWT token
    const payload = await verify(authToken, c.env.JWT_SECRET);
    
    if (!isUserClaims(payload)) {
      throw new Error('Invalid token payload');
    }
    
    c.set('claims', payload);
    await next();
  } catch (error) {
    console.error('Session verification error:', error);
    return c.json({ error: 'Invalid session' }, 401);
  }
}; 
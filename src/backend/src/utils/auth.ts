import { Context } from 'hono';
import { Env, User } from '../types';
import { sign } from 'hono/jwt';

export async function generateToken(user: User, env: Env): Promise<string> {
  return await sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
    },
    env.JWT_SECRET,
    'HS256'
  );
}

export function setAuthCookie(c: Context<{ Bindings: Env }>, token: string): void {
  c.header('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=604800`);
} 
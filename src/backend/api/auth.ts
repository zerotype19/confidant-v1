import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { nanoid } from 'nanoid';
import { getClaims } from '../auth';
import { D1Database } from '../types';
import { Context } from 'hono';
import { CookieOptions } from 'hono/utils/cookie';

interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  VITE_API_URL: string;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  auth_provider: string;
  auth_provider_id: string;
  created_at: string;
  updated_at: string;
}

interface GoogleUser {
  id: string;
  email: string;
  name: string;
}

type AuthJWTPayload = {
  [key: string]: string | number | null;
  sub: string;
  email: string;
  name: string | null;
  auth_provider: string;
  auth_provider_id: string;
  iat: number;
  exp: number;
};

const authRouter = new Hono<{ Bindings: Env }>();

// Helper function to set auth cookie
const setAuthCookie = (c: Context, token: string) => {
  const options: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  };
  c.header('Set-Cookie', `auth_token=${token}; ${Object.entries(options).map(([k, v]) => `${k}=${v}`).join('; ')}`);
};

// Helper function to generate JWT
const generateToken = async (user: User): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);
  const payload: AuthJWTPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    auth_provider: user.auth_provider,
    auth_provider_id: user.auth_provider_id,
    iat: now,
    exp: now + (60 * 60 * 24 * 7) // 1 week
  };
  return await sign(payload, 'your-jwt-secret'); // TODO: Move to environment variable
};

// Google OAuth endpoints
authRouter.get('/google', async (c) => {
  const redirectUri = `${c.env.VITE_API_URL}/api/auth/google/callback`;
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${c.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('openid email profile')}`;
  
  return c.redirect(googleAuthUrl);
});

authRouter.get('/google/callback', async (c) => {
  const { code } = c.req.query();
  const redirectUri = `${c.env.VITE_API_URL}/api/auth/google/callback`;

  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });

  const tokens = await tokenResponse.json();

  // Get user info from Google
  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  });
  const googleUser = await userInfoResponse.json() as GoogleUser;

  // Find or create user
  const { DB } = c.env;
  const existingUser = await DB.prepare(
    'SELECT * FROM users WHERE auth_provider = ? AND auth_provider_id = ?'
  ).bind('google', googleUser.id).first() as User | null;

  const user: User = existingUser || {
    id: nanoid(),
    email: googleUser.email,
    name: googleUser.name,
    auth_provider: 'google',
    auth_provider_id: googleUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (!existingUser) {
    // Create new user
    await DB.prepare(`
      INSERT INTO users (id, email, name, auth_provider, auth_provider_id)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      user.id,
      user.email,
      user.name,
      user.auth_provider,
      user.auth_provider_id
    ).run();
  }

  // Generate JWT and set cookie
  const token = await generateToken(user);
  setAuthCookie(c, token);
  return c.redirect('/onboarding/family');
});

// Logout endpoint
authRouter.post('/logout', async (c) => {
  setAuthCookie(c, '');
  return c.json({ success: true });
});

export default authRouter; 
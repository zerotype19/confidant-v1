import { Hono } from 'hono';
import { Env } from '../types';
import { nanoid } from 'nanoid';
import { verify } from 'hono/jwt';
import { Context } from 'hono';

const childrenRouter = new Hono<{ Bindings: Env }>();

// Middleware to extract user from cookie
async function getUserFromCookie(c: Context<{ Bindings: Env }>) {
  const cookie = c.req.header('cookie');
  if (!cookie) {
    return null;
  }

  const authToken = cookie.split(';')
    .find(c => c.trim().startsWith('auth_token='))
    ?.split('=')[1];

  if (!authToken) {
    return null;
  }

  try {
    return await verify(authToken, c.env.JWT_SECRET);
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Get all children for the current user
childrenRouter.get('/', async (c) => {
  try {
    const user = await getUserFromCookie(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { DB } = c.env;
    const children = await DB.prepare(
      'SELECT * FROM children WHERE user_id = ?'
    ).bind(user.userId).all();

    return c.json(children.results);
  } catch (error) {
    console.error('Error fetching children:', error);
    return c.json({ error: 'Failed to fetch children' }, 500);
  }
});

// Create a new child
childrenRouter.post('/', async (c) => {
  try {
    const user = await getUserFromCookie(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { name, age } = body;

    if (!name || !age) {
      return c.json({ error: 'Name and age are required' }, 400);
    }

    const { DB } = c.env;
    const childId = nanoid();

    await DB.prepare(`
      INSERT INTO children (id, user_id, name, age)
      VALUES (?, ?, ?, ?)
    `).bind(
      childId,
      user.userId,
      name,
      age
    ).run();

    return c.json({
      id: childId,
      user_id: user.userId,
      name,
      age,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating child:', error);
    return c.json({ error: 'Failed to create child' }, 500);
  }
});

export default childrenRouter; 
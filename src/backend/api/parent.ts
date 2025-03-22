import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { getClaims, verifySession } from '../auth';
import { z } from 'zod';

const parentRouter = new Hono();

const ParentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  timezone: z.string().min(1, 'Timezone is required'),
});

// Get parent profile
parentRouter.get('/', verifySession(), async (c) => {
  const claims = getClaims(c);
  const { db } = c.env;

  const parent = await db.prepare(
    'SELECT * FROM parents WHERE user_id = ?'
  ).bind(claims.sub).first();

  if (!parent) {
    return c.json({ error: 'Parent profile not found' }, 404);
  }

  return c.json(parent);
});

// Create or update parent profile
parentRouter.post('/setup', verifySession(), async (c) => {
  const claims = getClaims(c);
  const { db } = c.env;
  const body = await c.req.json();

  try {
    const data = ParentSchema.parse(body);
    
    // Check if parent profile exists
    const existingParent = await db.prepare(
      'SELECT id FROM parents WHERE user_id = ?'
    ).bind(claims.sub).first();

    if (existingParent) {
      // Update existing profile
      await db.prepare(`
        UPDATE parents 
        SET first_name = ?, last_name = ?, phone_number = ?, timezone = ?
        WHERE user_id = ?
      `).bind(
        data.firstName,
        data.lastName,
        data.phoneNumber,
        data.timezone,
        claims.sub
      ).run();

      return c.json({ message: 'Parent profile updated successfully' });
    }

    // Create new profile
    const id = nanoid();
    await db.prepare(`
      INSERT INTO parents (id, user_id, first_name, last_name, phone_number, timezone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      claims.sub,
      data.firstName,
      data.lastName,
      data.phoneNumber,
      data.timezone
    ).run();

    return c.json({ message: 'Parent profile created successfully' }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
    return c.json({ error: 'Failed to save parent profile' }, 500);
  }
});

export default parentRouter; 
import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { getClaims, verifySession } from '../auth';
import { z } from 'zod';

const childRouter = new Hono();

const ChildSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  schoolName: z.string().optional(),
  grade: z.string().optional(),
});

// Get child profiles for parent
childRouter.get('/', verifySession(), async (c) => {
  const claims = getClaims(c);
  const { db } = c.env;

  // Get parent ID first
  const parent = await db.prepare(
    'SELECT id FROM parents WHERE user_id = ?'
  ).bind(claims.sub).first();

  if (!parent) {
    return c.json({ error: 'Parent profile not found' }, 404);
  }

  const children = await db.prepare(
    'SELECT * FROM children WHERE parent_id = ?'
  ).bind(parent.id).all();

  return c.json(children);
});

// Create child profile
childRouter.post('/profile', verifySession(), async (c) => {
  const claims = getClaims(c);
  const { db } = c.env;
  const body = await c.req.json();

  try {
    const data = ChildSchema.parse(body);

    // Get parent ID first
    const parent = await db.prepare(
      'SELECT id FROM parents WHERE user_id = ?'
    ).bind(claims.sub).first();

    if (!parent) {
      return c.json({ error: 'Parent profile not found' }, 404);
    }

    const id = nanoid();
    await db.prepare(`
      INSERT INTO children (
        id, parent_id, first_name, last_name, 
        date_of_birth, gender, school_name, grade
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      parent.id,
      data.firstName,
      data.lastName,
      data.dateOfBirth,
      data.gender,
      data.schoolName || null,
      data.grade || null
    ).run();

    return c.json({ message: 'Child profile created successfully' }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
    return c.json({ error: 'Failed to save child profile' }, 500);
  }
});

// Update child profile
childRouter.put('/profile/:id', verifySession(), async (c) => {
  const claims = getClaims(c);
  const { db } = c.env;
  const { id } = c.req.param();
  const body = await c.req.json();

  try {
    const data = ChildSchema.parse(body);

    // Verify parent owns this child profile
    const parent = await db.prepare(
      'SELECT id FROM parents WHERE user_id = ?'
    ).bind(claims.sub).first();

    if (!parent) {
      return c.json({ error: 'Parent profile not found' }, 404);
    }

    const child = await db.prepare(
      'SELECT id FROM children WHERE id = ? AND parent_id = ?'
    ).bind(id, parent.id).first();

    if (!child) {
      return c.json({ error: 'Child profile not found' }, 404);
    }

    await db.prepare(`
      UPDATE children 
      SET first_name = ?, last_name = ?, date_of_birth = ?,
          gender = ?, school_name = ?, grade = ?
      WHERE id = ? AND parent_id = ?
    `).bind(
      data.firstName,
      data.lastName,
      data.dateOfBirth,
      data.gender,
      data.schoolName || null,
      data.grade || null,
      id,
      parent.id
    ).run();

    return c.json({ message: 'Child profile updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
    return c.json({ error: 'Failed to update child profile' }, 500);
  }
});

export default childRouter; 
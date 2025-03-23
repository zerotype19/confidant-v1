import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { getClaims, verifySession } from '../auth';
import { D1Database } from '../types';
import { z } from 'zod';

interface Env {
  DB: D1Database;
  R2: R2Bucket;
  R2_PUBLIC_URL: string;
  JWT_SECRET: string;
}

interface R2Bucket {
  put: (key: string, value: File, options?: { httpMetadata?: { contentType: string } }) => Promise<void>;
}

const childrenRouter = new Hono<{ Bindings: Env }>();

// Schema for adding/updating a child
const ChildSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(0, 'Age must be a positive number').optional(),
  avatar_url: z.string().url('Invalid avatar URL').optional()
});

// Add a child
childrenRouter.post('/', verifySession, async (c) => {
  try {
    const claims = getClaims(c);
    const { DB } = c.env;
    const body = await c.req.json();
    const data = ChildSchema.parse(body);

    // Get user's family
    const familyMember = await DB.prepare(`
      SELECT family_id FROM family_members 
      WHERE user_id = ? AND role = 'guardian'
    `).bind(claims.sub).first<{ family_id: string }>();

    if (!familyMember) {
      return c.json({ error: 'Family not found' }, 404);
    }

    // Create child profile
    const childId = nanoid();
    await DB.prepare(`
      INSERT INTO children (id, family_id, name, age, avatar_url)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      childId,
      familyMember.family_id,
      data.name,
      data.age || null,
      data.avatar_url || null
    ).run();

    // Get the created child
    const child = await DB.prepare(`
      SELECT id, name, age, avatar_url, created_at, updated_at
      FROM children
      WHERE id = ?
    `).bind(childId).first();

    return c.json({ child, message: 'Child added successfully' }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
    console.error('Error adding child:', error);
    return c.json({ error: 'Failed to add child' }, 500);
  }
});

// Update a child
childrenRouter.put('/:id', verifySession, async (c) => {
  try {
    const claims = getClaims(c);
    const { DB } = c.env;
    const childId = c.req.param('id');
    const body = await c.req.json();
    const data = ChildSchema.parse(body);

    // Verify child belongs to user's family
    const child = await DB.prepare(`
      SELECT c.* FROM children c
      JOIN family_members fm ON c.family_id = fm.family_id
      WHERE c.id = ? AND fm.user_id = ? AND fm.role = 'guardian'
    `).bind(childId, claims.sub).first();

    if (!child) {
      return c.json({ error: 'Child not found' }, 404);
    }

    // Update child profile
    await DB.prepare(`
      UPDATE children
      SET name = ?, age = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      data.name,
      data.age || null,
      data.avatar_url || null,
      childId
    ).run();

    // Get updated child
    const updatedChild = await DB.prepare(`
      SELECT id, name, age, avatar_url, created_at, updated_at
      FROM children
      WHERE id = ?
    `).bind(childId).first();

    return c.json({ child: updatedChild, message: 'Child updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
    console.error('Error updating child:', error);
    return c.json({ error: 'Failed to update child' }, 500);
  }
});

// Delete a child
childrenRouter.delete('/:id', verifySession, async (c) => {
  try {
    const claims = getClaims(c);
    const { DB } = c.env;
    const childId = c.req.param('id');

    // Verify child belongs to user's family
    const child = await DB.prepare(`
      SELECT c.* FROM children c
      JOIN family_members fm ON c.family_id = fm.family_id
      WHERE c.id = ? AND fm.user_id = ? AND fm.role = 'guardian'
    `).bind(childId, claims.sub).first();

    if (!child) {
      return c.json({ error: 'Child not found' }, 404);
    }

    // Delete child profile
    await DB.prepare(`
      DELETE FROM children
      WHERE id = ?
    `).bind(childId).run();

    return c.json({ message: 'Child deleted successfully' });
  } catch (error) {
    console.error('Error deleting child:', error);
    return c.json({ error: 'Failed to delete child' }, 500);
  }
});

// Get all children for the family
childrenRouter.get('/', verifySession, async (c) => {
  try {
    const claims = getClaims(c);
    const { DB } = c.env;

    // Get user's family
    const familyMember = await DB.prepare(`
      SELECT family_id FROM family_members 
      WHERE user_id = ? AND role = 'guardian'
    `).bind(claims.sub).first<{ family_id: string }>();

    if (!familyMember) {
      return c.json({ success: false, error: 'Family not found' }, 404);
    }

    // Get all children
    const children = await DB.prepare(`
      SELECT id, name, age, avatar_url, created_at, updated_at
      FROM children
      WHERE family_id = ?
      ORDER BY created_at DESC
    `).bind(familyMember.family_id).all();

    return c.json({ 
      success: true,
      results: children.results 
    });
  } catch (error) {
    console.error('Error getting children:', error);
    return c.json({ 
      success: false,
      error: 'Failed to get children' 
    }, 500);
  }
});

// Handle image upload
childrenRouter.post('/upload', verifySession, async (c) => {
  try {
    const { R2, R2_PUBLIC_URL } = c.env;
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'File must be an image' }, 400);
    }

    // Generate unique filename
    const extension = file.name.split('.').pop();
    const filename = `avatars/${nanoid()}.${extension}`;

    // Upload to R2
    await R2.put(filename, file, {
      httpMetadata: { contentType: file.type }
    });

    // Return public URL
    const url = `${R2_PUBLIC_URL}/${filename}`;
    return c.json({ url });
  } catch (error) {
    console.error('Error uploading image:', error);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

export default childrenRouter; 
import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { getClaims, verifySession } from '../auth';
import { z } from 'zod';

const onboardingRouter = new Hono();

const FamilySchema = z.object({
  name: z.string().min(1, 'Family name is required'),
});

const ChildSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(0, 'Age must be a positive number'),
  avatarUrl: z.string().optional(),
});

// Create family and add user as guardian
onboardingRouter.post('/family', verifySession(), async (c) => {
  const claims = getClaims(c);
  const { db } = c.env;
  const body = await c.req.json();

  try {
    const data = FamilySchema.parse(body);
    
    // Start a transaction
    await db.prepare('BEGIN TRANSACTION').run();

    try {
      // Create family
      const familyId = nanoid();
      await db.prepare(`
        INSERT INTO families (id, name)
        VALUES (?, ?)
      `).bind(familyId, data.name).run();

      // Add user as family member with guardian role
      const familyMemberId = nanoid();
      await db.prepare(`
        INSERT INTO family_members (id, family_id, user_id, role)
        VALUES (?, ?, ?, 'guardian')
      `).bind(familyMemberId, familyId, claims.sub).run();

      // Create free subscription
      const subscriptionId = nanoid();
      await db.prepare(`
        INSERT INTO subscriptions (id, family_id, status)
        VALUES (?, ?, 'free')
      `).bind(subscriptionId, familyId).run();

      await db.prepare('COMMIT').run();
      return c.json({ familyId, message: 'Family created successfully' }, 201);
    } catch (error) {
      await db.prepare('ROLLBACK').run();
      throw error;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
    return c.json({ error: 'Failed to create family' }, 500);
  }
});

// Add child to family
onboardingRouter.post('/child', verifySession(), async (c) => {
  const claims = getClaims(c);
  const { db } = c.env;
  const body = await c.req.json();

  try {
    const data = ChildSchema.parse(body);

    // Get user's family
    const familyMember = await db.prepare(`
      SELECT family_id FROM family_members 
      WHERE user_id = ? AND role = 'guardian'
    `).bind(claims.sub).first();

    if (!familyMember) {
      return c.json({ error: 'Family not found' }, 404);
    }

    // Create child profile
    const childId = nanoid();
    await db.prepare(`
      INSERT INTO children (id, family_id, name, age, avatar_url)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      childId,
      familyMember.family_id,
      data.name,
      data.age,
      data.avatarUrl || null
    ).run();

    return c.json({ 
      childId,
      message: 'Child profile created successfully' 
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
    return c.json({ error: 'Failed to create child profile' }, 500);
  }
});

// Get family details
onboardingRouter.get('/family', verifySession(), async (c) => {
  const claims = getClaims(c);
  const { db } = c.env;

  // Get user's family and children
  const familyMember = await db.prepare(`
    SELECT f.* FROM families f
    JOIN family_members fm ON fm.family_id = f.id
    WHERE fm.user_id = ? AND fm.role = 'guardian'
  `).bind(claims.sub).first();

  if (!familyMember) {
    return c.json({ error: 'Family not found' }, 404);
  }

  const children = await db.prepare(`
    SELECT id, name, age, avatar_url FROM children
    WHERE family_id = ?
  `).bind(familyMember.id).all();

  return c.json({
    family: familyMember,
    children
  });
});

export default onboardingRouter; 
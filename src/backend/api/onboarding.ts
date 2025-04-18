import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { verifySession, getClaims } from '../auth';
import { D1Database } from '../types';

interface Bindings {
  DB: D1Database;
  JWT_SECRET: string;
  ENVIRONMENT: string;
  API_URL: string;
  FRONTEND_URL: string;
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

interface Family {
  id: string;
  name: string;
  created_at: string;
}

interface Child {
  id: string;
  family_id: string;
  name: string;
  age: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface D1Result<T> {
  results: T[];
  success: boolean;
  error?: Error;
}

interface SessionClaims {
  sub: string;
  email: string;
  name: string | null;
  auth_provider: string;
  auth_provider_id: string;
}

const FamilySchema = z.object({
  name: z.string().min(1).max(100),
});

const ChildSchema = z.object({
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(18),
  avatarUrl: z.union([
    z.string().url(),
    z.string().length(0),
    z.null(),
  ]).optional().transform(val => val === '' ? null : val),
});

const onboardingRouter = new Hono<{ Bindings: Bindings }>();

// Create family and add user as guardian
onboardingRouter.post('/family', verifySession, async (c) => {
  const claims = getClaims(c);
  const { DB } = c.env;
  const body = await c.req.json();

  try {
    const data = FamilySchema.parse(body);
    console.log('Parsed family data:', data);
    
    const familyId = nanoid();
    const familyMemberId = nanoid();
    const subscriptionId = nanoid();
    
    // Use D1's batch API for atomic operations
    const result = await DB.batch([
      // Create user if they don't exist (will be ignored if user exists due to unique constraint)
      DB.prepare(`
        INSERT OR IGNORE INTO users (id, email, name, auth_provider, auth_provider_id)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        claims.sub,
        claims.email,
        claims.name || null,
        claims.auth_provider,
        claims.auth_provider_id
      ),
      
      // Create family
      DB.prepare(`
        INSERT INTO families (id, name)
        VALUES (?, ?)
      `).bind(familyId, data.name),
      
      // Add user as family member with guardian role
      DB.prepare(`
        INSERT INTO family_members (id, family_id, user_id, role)
        VALUES (?, ?, ?, 'guardian')
      `).bind(familyMemberId, familyId, claims.sub),
      
      // Create free subscription
      DB.prepare(`
        INSERT INTO subscriptions (id, family_id, stripe_customer_id, stripe_subscription_id, status)
        VALUES (?, ?, NULL, NULL, 'free')
      `).bind(subscriptionId, familyId)
    ]);

    console.log('Batch operation results:', result);
    return c.json({ familyId, message: 'Family created successfully' }, 201);
  } catch (error) {
    console.error('Family creation error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
    return c.json({ error: `Failed to create family: ${error.message}` }, 500);
  }
});

// Add child to family
onboardingRouter.post('/child', verifySession, async (c) => {
  const claims = getClaims(c);
  const { DB } = c.env;
  const body = await c.req.json();
  console.log('Received child data:', body);

  try {
    const data = ChildSchema.parse(body);
    console.log('Parsed child data:', data);

    // Get user's family
    const familyMember = await DB.prepare(`
      SELECT family_id FROM family_members 
      WHERE user_id = ? AND role = 'guardian'
    `).bind(claims.sub).first<{ family_id: string }>();

    if (!familyMember) {
      return c.json({ error: 'User is not a guardian of any family' }, 403);
    }

    // Create child profile
    const childId = nanoid();
    await DB.prepare(`
      INSERT INTO children (id, family_id, name, age, avatar_url)
      VALUES (?, ?, ?, ?, ?)
    `).bind(childId, familyMember.family_id, data.name, data.age, data.avatarUrl).run();

    return c.json({ childId, message: 'Child added successfully' }, 201);
  } catch (error) {
    console.error('Child creation error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400);
    }
    return c.json({ error: `Failed to add child: ${error.message}` }, 500);
  }
});

// Get family details
onboardingRouter.get('/family', verifySession, async (c) => {
  const claims = getClaims(c);
  const { DB } = c.env;

  // Get user's family and children
  const family = await DB.prepare(`
    SELECT f.id, f.name, f.created_at 
    FROM families f
    INNER JOIN family_members fm ON f.id = fm.family_id
    WHERE fm.user_id = ? AND fm.role = 'guardian'
  `).bind(claims.sub).first<Family>();

  if (!family) {
    return c.json({ error: 'Family not found' }, 404);
  }

  const children = await DB.prepare(`
    SELECT id, name, age, avatar_url, created_at, updated_at 
    FROM children
    WHERE family_id = ?
  `).bind(family.id).all<Child>();

  return c.json({ family, children });
});

export { onboardingRouter }; 
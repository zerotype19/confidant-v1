import { Hono } from 'hono';
import { verifySession, getClaims } from '../auth';
import { D1Database } from '../types';

interface Bindings {
  DB: D1Database;
  JWT_SECRET: string;
  ENVIRONMENT: string;
  API_URL: string;
  FRONTEND_URL: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: string;
  example_dialogue: string;
  tip: string;
  pillar_id: number;
  age_range: string;
  difficulty_level: number;
}

const challengesRouter = new Hono<{ Bindings: Bindings }>();

// Get today's challenge
challengesRouter.get('/today', verifySession, async (c) => {
  const claims = getClaims(c);
  const { DB } = c.env;

  try {
    // Get user's family and children
    const familyMember = await DB.prepare(`
      SELECT family_id FROM family_members 
      WHERE user_id = ? AND role = 'guardian'
    `).bind(claims.sub).first<{ family_id: string }>();

    if (!familyMember) {
      return c.json({ error: 'User is not a guardian of any family' }, 403);
    }

    // Get children's ages to find age-appropriate challenges
    const children = await DB.prepare(`
      SELECT age FROM children
      WHERE family_id = ?
    `).bind(familyMember.family_id).all<{ age: number }>();

    if (!children?.results?.length) {
      return c.json({ error: 'No children found in family' }, 404);
    }

    // Calculate the average age to find appropriate challenges
    const avgAge = Math.round(
      children.results.reduce((sum, child) => sum + child.age, 0) / children.results.length
    );

    // Get a random challenge appropriate for the average age
    // For now, we'll just get any challenge that matches the age range
    const challenge = await DB.prepare(`
      SELECT id, title, description, goal, steps, example_dialogue, tip, pillar_id, age_range, difficulty_level
      FROM challenges
      WHERE age_range LIKE ?
      ORDER BY RANDOM()
      LIMIT 1
    `).bind(`%${avgAge}%`).first<Challenge>();

    if (!challenge) {
      // Fallback to any challenge if no age-appropriate ones are found
      const fallbackChallenge = await DB.prepare(`
        SELECT id, title, description, goal, steps, example_dialogue, tip, pillar_id, age_range, difficulty_level
        FROM challenges
        ORDER BY RANDOM()
        LIMIT 1
      `).first<Challenge>();

      if (!fallbackChallenge) {
        return c.json({ error: 'No challenges found' }, 404);
      }

      return c.json({ challenge: fallbackChallenge });
    }

    return c.json({ challenge });
  } catch (error) {
    console.error('Error fetching today\'s challenge:', error);
    return c.json({ error: 'Failed to fetch today\'s challenge' }, 500);
  }
});

export { challengesRouter }; 
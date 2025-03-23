import { Hono } from 'hono';
import { nanoid } from 'nanoid';
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

interface Child {
  id: string;
  family_id: string;
  name: string;
  age: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

const challengesRouter = new Hono<{ Bindings: Bindings }>();

// Get today's challenge for a child
challengesRouter.get('/today', verifySession, async (c) => {
  try {
    const claims = getClaims(c);
    const { DB } = c.env;
    const childId = c.req.query('child_id');

    console.log('Getting challenge for child:', childId);

    if (!childId) {
      return c.json({ challenge: null, completed: false });
    }

    // Verify child belongs to user's family
    const child = await DB.prepare(`
      SELECT c.* FROM children c
      JOIN family_members fm ON c.family_id = fm.family_id
      WHERE c.id = ? AND fm.user_id = ? AND fm.role = 'guardian'
    `).bind(childId, claims.sub).first<Child>();

    if (!child) {
      console.log('Child not found:', childId);
      return c.json({ error: 'Child not found' }, 404);
    }

    console.log('Found child:', child);

    // Check if there's already a completed challenge for today
    const today = new Date().toISOString().split('T')[0];
    const completedToday = await DB.prepare(`
      SELECT challenge_id 
      FROM challenge_logs 
      WHERE child_id = ? 
      AND date(completed_at) = date(?)
    `).bind(childId, today).first<{ challenge_id: string }>();

    if (completedToday) {
      console.log('Found completed challenge for today:', completedToday);
      // Return the completed challenge
      const challenge = await DB.prepare(`
        SELECT * FROM challenges WHERE id = ?
      `).bind(completedToday.challenge_id).first<Challenge>();
      
      return c.json({ 
        challenge,
        completed: true 
      });
    }

    // Get recently completed challenges (last 7 days)
    const recentChallenges = await DB.prepare(`
      SELECT challenge_id 
      FROM challenge_logs 
      WHERE child_id = ? 
      AND completed_at >= datetime('now', '-7 days')
    `).bind(childId).all<{ challenge_id: string }>();

    const recentChallengeIds = recentChallenges.results?.map(c => c.challenge_id) || [];
    console.log('Recent challenge IDs:', recentChallengeIds);

    // Get pillar usage counts for this child
    const pillarUsage = await DB.prepare(`
      SELECT c.pillar_id, COUNT(*) as count
      FROM challenge_logs cl
      JOIN challenges c ON cl.challenge_id = c.id
      WHERE cl.child_id = ?
      GROUP BY c.pillar_id
      ORDER BY count ASC
    `).bind(childId).all<{ pillar_id: number; count: number }>();

    console.log('Pillar usage:', pillarUsage.results);

    // Create a map of pillar usage
    const pillarUsageMap = pillarUsage.results?.reduce((acc, { pillar_id, count }) => {
      acc[pillar_id] = count;
      return acc;
    }, {} as Record<number, number>) || {};

    // Find the least used pillar
    const leastUsedPillar = pillarUsage.results?.[0]?.pillar_id || 1;
    console.log('Least used pillar:', leastUsedPillar);

    // Get a challenge that:
    // 1. Matches the child's age range
    // 2. Hasn't been completed in the last 7 days
    // 3. Is from the least used pillar
    // 4. Is randomly selected from matching challenges
    const challengeQuery = `
      WITH matching_challenges AS (
        SELECT * FROM challenges 
        WHERE age_range = '6-9'
        AND pillar_id = ?
        ${recentChallengeIds.length ? `AND id NOT IN (${recentChallengeIds.map(() => '?').join(',')})` : ''}
      )
      SELECT id, title, description, goal, steps, example_dialogue, tip, pillar_id, age_range, difficulty_level, created_at, updated_at
      FROM matching_challenges
      ORDER BY RANDOM()
      LIMIT 1
    `;
    console.log('Challenge query:', challengeQuery);
    console.log('Query params:', [leastUsedPillar, ...recentChallengeIds]);

    const challenge = await DB.prepare(challengeQuery)
      .bind(leastUsedPillar, ...recentChallengeIds)
      .first<Challenge>();

    if (!challenge) {
      console.log('No challenge found with least used pillar, trying fallback');
      // If no challenge found with the least used pillar, try any age-appropriate challenge
      const fallbackQuery = `
        WITH matching_challenges AS (
          SELECT * FROM challenges 
          WHERE age_range = '6-9'
          ${recentChallengeIds.length ? `AND id NOT IN (${recentChallengeIds.map(() => '?').join(',')})` : ''}
        )
        SELECT id, title, description, goal, steps, example_dialogue, tip, pillar_id, age_range, difficulty_level, created_at, updated_at
        FROM matching_challenges
        ORDER BY RANDOM() 
        LIMIT 1
      `;
      console.log('Fallback query:', fallbackQuery);
      console.log('Fallback params:', [...recentChallengeIds]);

      const fallbackChallenge = await DB.prepare(fallbackQuery)
        .bind(...recentChallengeIds)
        .first<Challenge>();

      if (!fallbackChallenge) {
        console.log('No suitable challenges found');
        return c.json({ error: 'No suitable challenges found' }, 404);
      }

      console.log('Found fallback challenge:', fallbackChallenge);
      return c.json({ 
        challenge: fallbackChallenge,
        completed: false 
      });
    }

    console.log('Found challenge:', challenge);
    return c.json({ 
      challenge,
      completed: false 
    });
  } catch (error) {
    console.error('Error getting today\'s challenge:', error);
    return c.json({ error: 'Failed to get today\'s challenge' }, 500);
  }
});

// Complete a challenge
challengesRouter.post('/complete', verifySession, async (c) => {
  try {
    const claims = getClaims(c);
    const { DB } = c.env;
    const body = await c.req.json();
    const { child_id, challenge_id, reflection, mood_rating } = body;

    if (!child_id || !challenge_id) {
      return c.json({ error: 'Child ID and Challenge ID are required' }, 400);
    }

    // Verify child belongs to user's family
    const child = await DB.prepare(`
      SELECT c.* FROM children c
      JOIN family_members fm ON c.family_id = fm.family_id
      WHERE c.id = ? AND fm.user_id = ? AND fm.role = 'guardian'
    `).bind(child_id, claims.sub).first();

    if (!child) {
      return c.json({ error: 'Child not found' }, 404);
    }

    // Check if challenge exists
    const challenge = await DB.prepare(`
      SELECT * FROM challenges WHERE id = ?
    `).bind(challenge_id).first();

    if (!challenge) {
      return c.json({ error: 'Challenge not found' }, 404);
    }

    // Check if already completed today
    const today = new Date().toISOString().split('T')[0];
    const completedToday = await DB.prepare(`
      SELECT id FROM challenge_logs 
      WHERE child_id = ? 
      AND challenge_id = ? 
      AND date(completed_at) = date(?)
    `).bind(child_id, challenge_id, today).first();

    if (completedToday) {
      return c.json({ error: 'Challenge already completed today' }, 400);
    }

    // Log the completion
    const logId = nanoid();
    await DB.prepare(`
      INSERT INTO challenge_logs (id, child_id, challenge_id, reflection, mood_rating)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      logId,
      child_id,
      challenge_id,
      reflection || null,
      mood_rating || null
    ).run();

    return c.json({ 
      message: 'Challenge completed successfully',
      log_id: logId
    });
  } catch (error) {
    console.error('Error completing challenge:', error);
    return c.json({ error: 'Failed to complete challenge' }, 500);
  }
});

// Get all challenges
challengesRouter.get('/', verifySession, async (c) => {
  try {
    const { DB } = c.env;
    const childId = c.req.query('child_id');

    // Get all challenges
    const challenges = await DB.prepare(`
      SELECT * FROM challenges ORDER BY created_at DESC
    `).all<Challenge>();

    if (!childId) {
      return c.json({ challenges: [] });
    }

    // Get completed challenges for this child
    const completedChallenges = await DB.prepare(`
      SELECT challenge_id, completed_at 
      FROM challenge_logs 
      WHERE child_id = ?
    `).bind(childId).all<{ challenge_id: string; completed_at: string }>();

    const completedMap = completedChallenges.results?.reduce((acc, log) => {
      acc[log.challenge_id] = log.completed_at;
      return acc;
    }, {} as Record<string, string>) || {};

    // Add completed status to each challenge
    const challengesWithStatus = challenges.results?.map(challenge => ({
      ...challenge,
      completed: !!completedMap[challenge.id],
      completed_at: completedMap[challenge.id] || null
    }));

    return c.json({ challenges: challengesWithStatus });
  } catch (error) {
    console.error('Error getting challenges:', error);
    return c.json({ error: 'Failed to get challenges' }, 500);
  }
});

export { challengesRouter }; 
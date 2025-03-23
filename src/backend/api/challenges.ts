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

    console.log('Getting today\'s challenge for child:', childId);

    if (!childId) {
      return c.json({ success: true, challenge: null, completed: false });
    }

    // Verify child belongs to user's family
    const child = await DB.prepare(`
      SELECT c.* FROM children c
      JOIN family_members fm ON c.family_id = fm.family_id
      WHERE c.id = ? AND fm.user_id = ? AND fm.role = 'guardian'
    `).bind(childId, claims.sub).first<Child>();

    if (!child) {
      console.log('Child not found:', childId);
      return c.json({ success: false, error: 'Child not found' }, 404);
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
      
      if (!challenge) {
        console.error('Completed challenge not found:', completedToday.challenge_id);
        return c.json({ success: false, error: 'Completed challenge not found' }, 500);
      }

      return c.json({ 
        success: true,
        challenge,
        completed: true 
      });
    }

    // Get all challenges for the child's age range
    const challenges = await DB.prepare(`
      SELECT * FROM challenges 
      WHERE age_range = ?
      ORDER BY id
    `).bind('6-9').all<Challenge>();

    if (!challenges.success) {
      console.error('Failed to fetch challenges:', challenges.error);
      return c.json({ success: false, error: 'Failed to fetch challenges from database' }, 500);
    }

    if (!challenges.results?.length) {
      console.log('No challenges found for age range 6-9');
      return c.json({ success: false, error: 'No challenges found for age range' }, 404);
    }

    // Get recently completed challenges (last 7 days)
    const recentChallenges = await DB.prepare(`
      SELECT challenge_id 
      FROM challenge_logs 
      WHERE child_id = ? 
      AND completed_at >= date('now', '-7 days')
    `).bind(childId).all<{ challenge_id: string }>();

    if (!recentChallenges.success) {
      console.error('Failed to fetch recent challenges:', recentChallenges.error);
      return c.json({ success: false, error: 'Failed to fetch recent challenges' }, 500);
    }

    const recentChallengeIds = new Set(recentChallenges.results?.map(log => log.challenge_id) || []);

    // Get pillar usage counts
    const pillarCounts = await DB.prepare(`
      SELECT pillar_id, COUNT(*) as count
      FROM challenge_logs cl
      JOIN challenges c ON cl.challenge_id = c.id
      WHERE cl.child_id = ?
      GROUP BY pillar_id
    `).bind(childId).all<{ pillar_id: number; count: number }>();

    if (!pillarCounts.success) {
      console.error('Failed to fetch pillar counts:', pillarCounts.error);
      return c.json({ success: false, error: 'Failed to fetch pillar counts' }, 500);
    }

    const pillarUsage = pillarCounts.results?.reduce((acc, { pillar_id, count }) => {
      acc[pillar_id] = count;
      return acc;
    }, {} as Record<number, number>) || {};

    // Find the least used pillar
    const leastUsedPillar = Array.from({ length: 5 }, (_, i) => i + 1)
      .reduce((min, pillar) => 
        (pillarUsage[pillar] || 0) < (pillarUsage[min] || 0) ? pillar : min
      );

    // Find a challenge that:
    // 1. Matches the least used pillar
    // 2. Hasn't been completed recently
    // 3. Is age-appropriate
    let challenge = challenges.results.find(c => 
      c.pillar_id === leastUsedPillar && 
      !recentChallengeIds.has(c.id)
    );

    // If no challenge found with least used pillar, try any age-appropriate challenge
    if (!challenge) {
      console.log('No challenge found with least used pillar, trying any age-appropriate challenge');
      challenge = challenges.results.find(c => !recentChallengeIds.has(c.id));
    }

    if (!challenge) {
      console.log('No suitable challenges found');
      return c.json({ success: false, error: 'No suitable challenges found' }, 404);
    }

    console.log('Found challenge:', challenge);
    return c.json({ 
      success: true,
      challenge,
      completed: false 
    });
  } catch (error) {
    console.error('Error getting today\'s challenge:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Failed to get today\'s challenge' }, 500);
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
      SELECT * FROM challenges ORDER BY id
    `).all<Challenge>();

    if (!childId) {
      return c.json({ success: true, results: [] });
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

    return c.json({ success: true, results: challengesWithStatus });
  } catch (error) {
    console.error('Error getting challenges:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Failed to get challenges' }, 500);
  }
});

export { challengesRouter }; 
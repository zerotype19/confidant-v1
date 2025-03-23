import { Hono } from 'hono';
import { db } from '../db';
import { Env } from '../types';

interface RawTechnique {
  id: string;
  title: string;
  description: string;
  steps: string;
  example_dialogue: string;
  common_mistakes: string;
  use_cases: string;
  pillar_ids: string;
  age_range: string;
}

interface Technique {
  id: string;
  title: string;
  description: string;
  steps: string[];
  example_dialogue: string;
  common_mistakes: string[];
  use_cases: string[];
  pillar_ids: number[];
  age_range: string;
}

const techniquesRouter = new Hono<{ Bindings: Env }>();

// Get all techniques
techniquesRouter.get('/', async (c) => {
  try {
    const { results } = await db.prepare(`
      SELECT 
        id,
        title,
        description,
        json_extract(steps, '$') as steps,
        example_dialogue,
        json_extract(common_mistakes, '$') as common_mistakes,
        json_extract(use_cases, '$') as use_cases,
        json_extract(pillar_ids, '$') as pillar_ids,
        age_range
      FROM techniques
      ORDER BY title ASC
    `).all<RawTechnique>();
    
    // Parse JSON strings back into arrays
    const techniques = results.map((technique: RawTechnique): Technique => ({
      ...technique,
      steps: JSON.parse(technique.steps || '[]'),
      common_mistakes: JSON.parse(technique.common_mistakes || '[]'),
      use_cases: JSON.parse(technique.use_cases || '[]'),
      pillar_ids: JSON.parse(technique.pillar_ids || '[]'),
    }));

    return c.json(techniques);
  } catch (error) {
    console.error('Error fetching techniques:', error);
    return c.json({ error: 'Failed to fetch techniques' }, 500);
  }
});

// Complete a technique
techniquesRouter.post('/:id/complete', async (c) => {
  try {
    const id = c.req.param('id');
    const { reflection, mood_rating } = await c.req.json();
    const userId = c.get('jwtPayload').id;

    // Create a technique completion record
    const { success } = await db.prepare(`
      INSERT INTO technique_completions (
        id,
        technique_id,
        user_id,
        reflection,
        mood_rating,
        created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      crypto.randomUUID(),
      id,
      userId,
      reflection || null,
      mood_rating || null
    ).run();

    if (!success) {
      throw new Error('Failed to create technique completion');
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error completing technique:', error);
    return c.json({ error: 'Failed to complete technique' }, 500);
  }
});

export default techniquesRouter; 
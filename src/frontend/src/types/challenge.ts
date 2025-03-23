export interface Challenge {
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
  created_at?: string;
  updated_at?: string;
}

export interface ChallengeWithStatus extends Challenge {
  completed: boolean;
  completed_at: string | null;
}

export interface ChallengeLog {
  id: string;
  child_id: string;
  challenge_id: string;
  reflection: string | null;
  mood_rating: number | null;
  completed_at: string;
}

export interface CompleteChallengeInput {
  child_id: string;
  challenge_id: string;
  reflection?: string;
  mood_rating?: number;
}

export interface TodaysChallengeResponse {
  challenge: Challenge;
  completed: boolean;
} 
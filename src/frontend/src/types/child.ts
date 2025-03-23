export interface Child {
  id: string;
  name: string;
  age: number;
  avatar?: string;
  challenges?: Challenge[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  goal: string;
  steps: string[];
  example_dialogue: string;
  tip: string;
  pillar_id: number;
  age_range: string;
  difficulty_level: number;
  estimated_time?: string;
} 
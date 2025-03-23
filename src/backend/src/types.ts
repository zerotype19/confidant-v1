export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  API_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  auth_provider: string;
  auth_provider_id: string;
  created_at: string;
  updated_at: string;
} 
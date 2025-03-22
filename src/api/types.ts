import { Context } from 'hono'

export interface Env {
  DB: D1Database
  GOOGLE_CLIENT_ID: string
  GOOGLE_OAUTH_CLIENT_SECRET: string
  API_URL: string
  FRONTEND_URL: string
}

export interface AuthContext extends Context<Env> {
  user: {
    id: string
    email: string
    name: string | null
  }
}

export interface User {
  id: string
  email: string
  password_hash: string
  name: string
  auth_provider?: string
  auth_provider_id?: string
} 
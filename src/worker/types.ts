import { Context } from "hono"

export interface Bindings {
  DB: D1Database
  STORAGE: R2Bucket
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  API_URL: string
  FRONTEND_URL: string
  [key: string]: any
}

export type Env = {
  Bindings: Bindings
}

export interface AuthContext extends Context<Env> {
  user: {
    id: string
    email: string
    name: string | null
  }
} 
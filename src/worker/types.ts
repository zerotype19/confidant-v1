import { Context } from "hono"
import { D1Database, R2Bucket } from "@cloudflare/workers-types"

export interface Bindings {
  DB: D1Database
  STORAGE: R2Bucket
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  API_URL: string
  FRONTEND_URL: string
  [key: string]: any
}

export interface Env {
  DB: D1Database
  STORAGE: R2Bucket
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  API_URL: string
  FRONTEND_URL: string
}

export interface AuthContext extends Context<Env> {
  user: {
    id: string
    email: string
    name: string
  }
}

declare module "hono" {
  interface ContextVariableMap {
    user: {
      id: string
      email: string
      name: string
    }
  }
} 
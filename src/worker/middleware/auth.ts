import { Context, Next } from "hono"
import { HTTPException } from "hono/http-exception"
import jwt from "jsonwebtoken"
import { Env } from "../types"

const JWT_SECRET = "your-secret-key" // TODO: Move to environment variable

interface Session {
  user_id: string
  email: string
  name: string | null
}

interface JWTPayload {
  userId: string
}

export interface AuthContext extends Context<Env> {
  user: {
    id: string
    email: string
    name: string | null
  }
}

export async function authMiddleware(c: Context<Env>, next: Next) {
  const token = c.req.header("Authorization")?.split(" ")[1]
  if (!token) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload
    const db = c.env.DB

    const session = await db
      .prepare(
        "SELECT s.*, u.id as user_id, u.email, u.name FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > datetime('now')"
      )
      .bind(payload.userId)
      .first<Session>()

    if (!session) {
      throw new HTTPException(401, { message: "Session expired" })
    }

    ;(c as AuthContext).user = {
      id: session.user_id,
      email: session.email,
      name: session.name,
    }

    await next()
  } catch (error) {
    throw new HTTPException(401, { message: "Invalid token" })
  }
} 
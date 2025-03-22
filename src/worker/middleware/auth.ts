import { Context, Next } from "hono"
import { HTTPException } from "hono/http-exception"
import { createJWT } from "lucia/jwt"
import { Env } from "../types"

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

  const db = c.env.DB
  const sessionId = await createJWT.verify(token)

  const session = await db
    .prepare(
      "SELECT s.*, u.id as user_id, u.email, u.name FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > datetime('now')"
    )
    .bind(sessionId)
    .first()

  if (!session) {
    throw new HTTPException(401, { message: "Session expired" })
  }

  ;(c as AuthContext).user = {
    id: session.user_id,
    email: session.email,
    name: session.name,
  }

  await next()
} 
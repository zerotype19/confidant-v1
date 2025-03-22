import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { generateId } from "lucia"
import { Argon2id } from "oslo/password"
import { createJWT } from "lucia/jwt"
import { GoogleOAuth2Client } from "oslo/oauth"
import { authMiddleware } from "../middleware/auth"
import { Env, AuthContext } from "../types"

const auth = new Hono<Env>()

// Validation schemas
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
})

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// Initialize Google OAuth client
const googleClient = new GoogleOAuth2Client(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.API_URL}/api/auth/google/callback`
)

// Get current user
auth.get("/me", authMiddleware, async (c) => {
  const db = c.env.DB
  const userId = (c as AuthContext).user.id

  // Get user's families
  const families = await db
    .prepare(
      `SELECT f.*, fm.role 
       FROM families f 
       JOIN family_members fm ON f.id = fm.family_id 
       WHERE fm.user_id = ?`
    )
    .bind(userId)
    .all()

  return c.json({
    user: {
      id: (c as AuthContext).user.id,
      email: (c as AuthContext).user.email,
      name: (c as AuthContext).user.name,
    },
    families: families.results,
  })
})

// Sign up with email/password
auth.post("/signup", zValidator("json", signUpSchema), async (c) => {
  const { email, password, name } = c.req.valid("json")
  const db = c.env.DB

  // Check if user exists
  const existingUser = await db
    .prepare("SELECT * FROM users WHERE email = ?")
    .bind(email)
    .first()

  if (existingUser) {
    throw new HTTPException(400, { message: "Email already registered" })
  }

  // Hash password
  const hashedPassword = await new Argon2id().hash(password)

  // Create user
  const userId = generateId(15)
  await db
    .prepare(
      "INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, datetime('now'))"
    )
    .bind(userId, email, hashedPassword, name)
    .run()

  // Create default family
  const familyId = generateId(15)
  await db
    .prepare(
      "INSERT INTO families (id, name, created_at) VALUES (?, ?, datetime('now'))"
    )
    .bind(familyId, `${name}'s Family`)
    .run()

  // Add user to family
  await db
    .prepare(
      "INSERT INTO family_members (id, family_id, user_id, role) VALUES (?, ?, ?, 'guardian')"
    )
    .bind(generateId(15), familyId, userId)
    .run()

  // Create session
  const sessionId = generateId(15)
  const token = await createJWT(sessionId, {
    userId,
    expiresIn: "30d",
  })

  await db
    .prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+30 days'))"
    )
    .bind(sessionId, userId)
    .run()

  return c.json({ token })
})

// Sign in with email/password
auth.post("/signin", zValidator("json", signInSchema), async (c) => {
  const { email, password } = c.req.valid("json")
  const db = c.env.DB

  // Get user
  const user = await db
    .prepare("SELECT * FROM users WHERE email = ?")
    .bind(email)
    .first()

  if (!user) {
    throw new HTTPException(400, { message: "Invalid email or password" })
  }

  // Verify password
  const validPassword = await new Argon2id().verify(
    user.password_hash,
    password
  )

  if (!validPassword) {
    throw new HTTPException(400, { message: "Invalid email or password" })
  }

  // Create session
  const sessionId = generateId(15)
  const token = await createJWT(sessionId, {
    userId: user.id,
    expiresIn: "30d",
  })

  await db
    .prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+30 days'))"
    )
    .bind(sessionId, user.id)
    .run()

  return c.json({ token })
})

// Google OAuth login
auth.get("/google", async (c) => {
  const [url, state] = await googleClient.createAuthorizationURL({
    scope: ["email", "profile"],
  })

  // Store state in cookie for verification
  c.cookie("oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  })

  return c.redirect(url.toString())
})

// Google OAuth callback
auth.get("/google/callback", async (c) => {
  const state = c.cookie("oauth_state") || ""
  const searchParams = new URL(c.req.url).searchParams
  const code = searchParams.get("code")
  const returnedState = searchParams.get("state")

  if (!state || !code || !returnedState || state !== returnedState) {
    throw new HTTPException(400, { message: "Invalid OAuth state" })
  }

  const { accessToken, idToken } = await googleClient.validateCallback(code)
  const googleUser = await googleClient.getUserInfo(accessToken)

  const db = c.env.DB

  // Check if user exists
  let user = await db
    .prepare("SELECT * FROM users WHERE email = ?")
    .bind(googleUser.email)
    .first()

  if (!user) {
    // Create new user
    const userId = generateId(15)
    await db
      .prepare(
        "INSERT INTO users (id, email, name, auth_provider, auth_provider_id, created_at) VALUES (?, ?, ?, 'google', ?, datetime('now'))"
      )
      .bind(userId, googleUser.email, googleUser.name, googleUser.id)
      .run()

    // Create default family
    const familyId = generateId(15)
    await db
      .prepare(
        "INSERT INTO families (id, name, created_at) VALUES (?, ?, datetime('now'))"
      )
      .bind(familyId, `${googleUser.name}'s Family`)
      .run()

    // Add user to family
    await db
      .prepare(
        "INSERT INTO family_members (id, family_id, user_id, role) VALUES (?, ?, ?, 'guardian')"
      )
      .bind(generateId(15), familyId, userId)
      .run()

    user = {
      id: userId,
      email: googleUser.email,
      name: googleUser.name,
    }
  }

  // Create session
  const sessionId = generateId(15)
  const token = await createJWT(sessionId, {
    userId: user.id,
    expiresIn: "30d",
  })

  await db
    .prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', '+30 days'))"
    )
    .bind(sessionId, user.id)
    .run()

  // Redirect to frontend with token
  return c.redirect(
    `${c.env.FRONTEND_URL}/auth/callback?token=${token}`
  )
})

// Sign out
auth.post("/signout", authMiddleware, async (c) => {
  const token = c.req.header("Authorization")?.split(" ")[1]
  if (!token) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }

  const db = c.env.DB
  const sessionId = await createJWT.verify(token)

  await db
    .prepare("DELETE FROM sessions WHERE id = ?")
    .bind(sessionId)
    .run()

  return c.json({ success: true })
})

export default auth 
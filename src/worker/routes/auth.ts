import { Hono, Context } from "hono"
import { HTTPException } from "hono/http-exception"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { googleAuth } from "@hono/oauth-providers/google"
import { Env, AuthContext } from "../types"
import { signJWT, verifyJWT } from "../utils/jwt"

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

type SignUpBody = z.infer<typeof signUpSchema>
type SignInBody = z.infer<typeof signInSchema>

// Initialize Google OAuth client
const initGoogleAuth = (c: Context<Env>) => googleAuth({
  client_id: c.env.GOOGLE_CLIENT_ID,
  client_secret: c.env.GOOGLE_CLIENT_SECRET,
  redirect_uri: `${c.env.API_URL}/api/auth/google/callback`,
  scope: ["email", "profile"],
})

// Get current user
auth.get("/me", async (c: Context<Env>) => {
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
auth.post("/signup", zValidator("json", signUpSchema), async (c: Context<Env>) => {
  const data = c.req.valid("json") as SignUpBody
  const { email, password, name } = data
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
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // Create user
  const userId = crypto.randomUUID()
  await db
    .prepare(
      "INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, datetime('now'))"
    )
    .bind(userId, email, hashedPassword, name)
    .run()

  // Create default family
  const familyId = crypto.randomUUID()
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
    .bind(crypto.randomUUID(), familyId, userId)
    .run()

  // Create token
  const token = await signJWT({ userId })

  return c.json({ token })
})

// Sign in with email/password
auth.post("/signin", zValidator("json", signInSchema), async (c: Context<Env>) => {
  const data = c.req.valid("json") as SignInBody
  const { email, password } = data
  const db = c.env.DB

  // Get user
  const user = await db
    .prepare("SELECT * FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: string; password_hash: string }>()

  if (!user) {
    throw new HTTPException(400, { message: "Invalid email or password" })
  }

  // Verify password
  const validPassword = await bcrypt.compare(password, user.password_hash)

  if (!validPassword) {
    throw new HTTPException(400, { message: "Invalid email or password" })
  }

  // Create token
  const token = await signJWT({ userId: user.id })

  return c.json({ token })
})

// Google OAuth login
auth.get("/google", async (c: Context<Env>) => {
  const google = initGoogleAuth(c)
  const authUrl = await google.getAuthorizationUrl(c)
  return c.redirect(authUrl)
})

// Google OAuth callback
auth.get("/google/callback", async (c: Context<Env>) => {
  const code = c.req.query("code")
  if (!code) {
    throw new HTTPException(400, { message: "Missing authorization code" })
  }

  const google = initGoogleAuth(c)
  const oauth = await google.getAccessToken(c, code)
  const userInfo = await google.getUserInfo(oauth.accessToken)

  const db = c.env.DB

  // Check if user exists
  let user = await db
    .prepare("SELECT * FROM users WHERE email = ?")
    .bind(userInfo.email)
    .first<{ id: string; email: string; name: string }>()

  if (!user) {
    // Create new user
    const userId = crypto.randomUUID()
    await db
      .prepare(
        "INSERT INTO users (id, email, name, auth_provider, auth_provider_id, created_at) VALUES (?, ?, ?, 'google', ?, datetime('now'))"
      )
      .bind(userId, userInfo.email, userInfo.name, userInfo.sub)
      .run()

    // Create default family
    const familyId = crypto.randomUUID()
    await db
      .prepare(
        "INSERT INTO families (id, name, created_at) VALUES (?, ?, datetime('now'))"
      )
      .bind(familyId, `${userInfo.name}'s Family`)
      .run()

    // Add user to family
    await db
      .prepare(
        "INSERT INTO family_members (id, family_id, user_id, role) VALUES (?, ?, ?, 'guardian')"
      )
      .bind(crypto.randomUUID(), familyId, userId)
      .run()

    user = {
      id: userId,
      email: userInfo.email,
      name: userInfo.name,
    }
  }

  // Create token
  const token = await signJWT({ userId: user.id })

  // Redirect to frontend with token
  return c.redirect(
    `${c.env.FRONTEND_URL}/auth/callback?token=${token}`
  )
})

// Sign out
auth.post("/signout", async (c: Context<Env>) => {
  const token = c.req.header("Authorization")?.split(" ")[1]
  if (!token) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }

  try {
    const payload = await verifyJWT(token)
    return c.json({ success: true })
  } catch (error) {
    throw new HTTPException(401, { message: "Invalid token" })
  }
})

export default auth 
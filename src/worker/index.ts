import { Hono } from "hono"
import { cors } from "hono/cors"
import { prettyJSON } from "hono/pretty-json"
import auth from "./routes/auth"
import { Env } from "./types"

const app = new Hono<Env>()

// Middleware
app.use("*", prettyJSON())
app.use("*", cors({
  origin: [process.env.FRONTEND_URL!],
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}))

// Routes
app.route("/api/auth", auth)

// Health check
app.get("/health", (c) => c.json({ status: "ok" }))

export default app 
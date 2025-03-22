import { Hono, Context } from "hono"
import { cors } from "hono/cors"
import { prettyJSON } from "hono/pretty-json"
import { Env } from "./types"
import auth from "./routes/auth"

const app = new Hono<Env>()

// Middleware
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
  maxAge: 86400,
  credentials: true,
}))

app.use("*", prettyJSON())

// Health check
app.get("/health", (c: Context<Env>) => c.json({ status: "ok" }))

// Routes
app.route("/api/auth", auth)

export default app 
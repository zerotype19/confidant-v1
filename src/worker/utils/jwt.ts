const JWT_SECRET = "your-secret-key" // TODO: Move to environment variable

// Convert string to base64url
function base64url(str: string): string {
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

// Convert base64url to string
function base64urlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/")
  while (str.length % 4) str += "="
  return atob(str)
}

// Sign JWT
export async function signJWT(payload: any, expiresIn: string = "30d"): Promise<string> {
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const now = Math.floor(Date.now() / 1000)
  const exp = now + (expiresIn === "30d" ? 30 * 24 * 60 * 60 : parseInt(expiresIn))

  const encodedHeader = base64url(JSON.stringify(header))
  const encodedPayload = base64url(
    JSON.stringify({
      ...payload,
      iat: now,
      exp,
    })
  )

  const message = `${encodedHeader}.${encodedPayload}`
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  )

  const encodedSignature = base64url(
    String.fromCharCode(...new Uint8Array(signature))
  )

  return `${message}.${encodedSignature}`
}

// Verify JWT
export async function verifyJWT(token: string): Promise<any> {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".")

  // Verify signature
  const message = `${encodedHeader}.${encodedPayload}`
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  )

  const signature = Uint8Array.from(
    base64urlDecode(encodedSignature),
    (c) => c.charCodeAt(0)
  )

  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    new TextEncoder().encode(message)
  )

  if (!isValid) {
    throw new Error("Invalid signature")
  }

  // Verify expiration
  const payload = JSON.parse(base64urlDecode(encodedPayload))
  const now = Math.floor(Date.now() / 1000)

  if (payload.exp && payload.exp < now) {
    throw new Error("Token expired")
  }

  return payload
} 
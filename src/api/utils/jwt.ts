import { sign, verify, SignCallback, VerifyCallback } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key' // TODO: Move to environment variable
const JWT_EXPIRES_IN = '7d'

export interface JWTPayload {
  userId: string
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new Promise((resolve, reject) => {
    sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }, ((err: Error | null, token: string | undefined) => {
      if (err || !token) reject(err || new Error('Failed to sign token'))
      else resolve(token)
    }) as SignCallback)
  })
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  return new Promise((resolve, reject) => {
    verify(token, JWT_SECRET, ((err: Error | null, payload: JWTPayload | undefined) => {
      if (err || !payload) reject(err || new Error('Invalid token'))
      else resolve(payload)
    }) as VerifyCallback)
  })
} 
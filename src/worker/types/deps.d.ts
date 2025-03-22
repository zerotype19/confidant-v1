declare module 'lucia' {
  export function generateId(length: number): string;
}

declare module 'lucia/jwt' {
  export const createJWT: {
    (sessionId: string, options: { userId: string; expiresIn: string }): Promise<string>;
    verify(token: string): Promise<string>;
  };
}

declare module 'oslo/password' {
  export class Argon2id {
    hash(password: string): Promise<string>;
    verify(hash: string, password: string): Promise<boolean>;
  }
}

declare module 'oslo/oauth' {
  export class GoogleOAuth2Client {
    constructor(clientId: string, clientSecret: string, redirectUri: string);
    createAuthorizationURL(options: { scope: string[] }): Promise<[URL, string]>;
    validateCallback(code: string): Promise<{ accessToken: string; idToken: string }>;
    getUserInfo(accessToken: string): Promise<{ id: string; email: string; name: string }>;
  }
}

declare module 'hono' {
  export class Hono<E = {}> {
    get(path: string, ...handlers: any[]): this
    post(path: string, ...handlers: any[]): this
    put(path: string, ...handlers: any[]): this
    delete(path: string, ...handlers: any[]): this
    use(path: string, ...handlers: any[]): this
    route(path: string, app: Hono<E>): this
  }

  export class Context<E = {}> {
    env: E
    req: {
      url: string
      header(name: string): string | undefined
      query(name: string): string | undefined
      valid<T>(type: string): T
    }
    json(data: any): Response
    redirect(url: string): Response
    cookie(name: string, value?: string, options?: {
      httpOnly?: boolean
      secure?: boolean
      sameSite?: 'Strict' | 'Lax' | 'None'
      maxAge?: number
      path?: string
    }): string | undefined
  }

  export type Next = () => Promise<void>
}

declare module 'hono/http-exception' {
  export class HTTPException extends Error {
    constructor(status: number, options?: { message?: string })
  }
}

declare module '@hono/zod-validator' {
  import { z } from 'zod'
  export function zValidator(type: string, schema: z.ZodType): any
}

declare module '@hono/oauth-providers/google' {
  import { Context } from 'hono'
  export function googleAuth(options: {
    client_id: string
    client_secret: string
    redirect_uri: string
    scope: string[]
  }): {
    getAuthorizationUrl(c: Context): Promise<string>
    getAccessToken(c: Context, code: string): Promise<{ accessToken: string }>
    getUserInfo(accessToken: string): Promise<{
      sub: string
      email: string
      name: string
    }>
  }
} 
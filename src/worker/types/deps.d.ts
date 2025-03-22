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
  interface Context {
    cookie(name: string, value?: string, options?: {
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: 'Strict' | 'Lax' | 'None';
      maxAge?: number;
      path?: string;
    }): string | undefined;
  }
} 
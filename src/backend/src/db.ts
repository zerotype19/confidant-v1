import { D1Database } from '@cloudflare/workers-types';

declare global {
  interface Env {
    DB: D1Database;
    JWT_SECRET: string;
    FRONTEND_URL: string;
  }
}

let db: D1Database;

export function setDb(database: D1Database) {
  db = database;
}

export { db }; 
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1Result<unknown>>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: Error;
  meta?: {
    last_row_id?: number;
    changes?: number;
    duration?: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  auth_provider: string;
  auth_provider_id: string;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  name: string;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: 'guardian';
  // Note: No timestamps in schema
}

export interface Child {
  id: string;
  family_id: string;
  name: string;
  age: number | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  family_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: 'free' | 'premium';
  updated_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  goal: string | null;
  steps: string | null;
  example_dialogue: string | null;
  tip: string | null;
  pillar_id: number;
  age_range: string | null;
  difficulty_level: number;
}

export interface ChallengeLog {
  id: string;
  child_id: string;
  challenge_id: string;
  completed_by_user_id: string;
  completed_at: string;
  reflection: string | null;
  mood_rating: number | null;
}

export interface Technique {
  id: string;
  title: string | null;
  description: string | null;
  steps: string | null;
  example_dialogue: string | null;
  common_mistakes: string | null;
  use_cases: string | null;
  pillar_ids: string | null;
  age_range: string | null;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  child_id: string;
  entry: string;
  tags: string | null;
  created_at: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  flag_key: string;
  premium_only: boolean;
}

export interface MediaAsset {
  id: string;
  user_id: string | null;
  child_id: string | null;
  url: string;
  type: string | null;
  created_at: string;
}

// R2 types
export interface R2Bucket {
  put(key: string, value: ArrayBuffer | ArrayBufferView | Blob | File | string | null, options?: {
    customMetadata?: Record<string, string>;
    httpMetadata?: {
      contentType?: string;
      cacheControl?: string;
      contentDisposition?: string;
      contentEncoding?: string;
      contentLanguage?: string;
    };
  }): Promise<void>;
  get(key: string): Promise<R2Object | null>;
  delete(key: string): Promise<void>;
}

export interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  checksums: {
    md5?: string;
    sha1?: string;
    sha256?: string;
    sha384?: string;
    sha512?: string;
  };
  uploaded: Date;
  httpMetadata?: {
    contentType: string;
    contentLanguage?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    cacheControl?: string;
  };
  customMetadata?: Record<string, string>;
  body: ReadableStream;
  bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T>(): Promise<T>;
  blob(): Promise<Blob>;
} 
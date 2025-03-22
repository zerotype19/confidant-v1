declare interface D1Database {
  prepare(query: string): D1PreparedStatement
  exec(query: string): Promise<D1Result>
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>
  dump(): Promise<ArrayBuffer>
}

declare interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = unknown>(colName?: string): Promise<T | null>
  run<T = unknown>(): Promise<D1Result<T>>
  all<T = unknown>(): Promise<D1Result<T>>
}

declare interface D1Result<T = unknown> {
  results?: T[]
  success: boolean
  error?: Error
  meta: {
    duration: number
    last_row_id: number
    changes: number
    size: number
  }
} 
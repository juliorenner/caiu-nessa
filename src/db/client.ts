import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import * as schema from './schema'

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>

let db: Db | undefined

export function getDb(): Db {
  if (db) return db
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL não definida')
  db = drizzle(neon(url), { schema })
  return db
}

import path from 'node:path'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import * as schema from './schema'

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>

let db: Promise<Db> | undefined

// DATABASE_URL=file:<caminho> abre um PGlite local (desenvolvimento, sem serviços externos);
// qualquer outro valor usa o Neon. O caminho é relativo ao diretório do projeto.
export function getDb(): Promise<Db> {
  if (db) return db
  const url = process.env.DATABASE_URL
  if (!url) return Promise.reject(new Error('DATABASE_URL não definida'))
  const novo = url.startsWith('file:')
    ? abrirPglite(path.resolve(/*turbopackIgnore: true*/ process.cwd(), url.slice('file:'.length)))
    : Promise.resolve(drizzle(neon(url), { schema }))
  db = novo
  novo.catch(() => {
    if (db === novo) db = undefined
  })
  return novo
}

async function abrirPglite(caminho: string): Promise<Db> {
  // Imports dinâmicos: o caminho do Neon não carrega o WASM do PGlite.
  const { PGlite } = await import('@electric-sql/pglite')
  const { drizzle: drizzlePglite } = await import('drizzle-orm/pglite')
  const { migrate } = await import('drizzle-orm/pglite/migrator')
  const instancia = drizzlePglite(new PGlite(caminho), { schema })
  await migrate(instancia, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') })
  return instancia
}

/** Somente para testes: descarta a instância memoizada. */
export function resetDbParaTestes(): void {
  db = undefined
}

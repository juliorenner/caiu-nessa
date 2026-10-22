import path from 'node:path'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import * as schema from './schema'

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>

interface Aberto {
  db: Db
  fechar: () => Promise<void>
}

// O fechamento fica junto da instância memoizada: um reset fecha exatamente o que capturou.
let memo: { aberto: Promise<Aberto>; db: Promise<Db> } | undefined

// DATABASE_URL=file:<caminho> abre um PGlite local (desenvolvimento, sem serviços externos);
// qualquer outro valor usa o Neon. O caminho é relativo ao diretório do projeto.
export function getDb(): Promise<Db> {
  if (memo) return memo.db
  const url = process.env.DATABASE_URL
  if (!url) return Promise.reject(new Error('DATABASE_URL não definida'))
  const aberto = url.startsWith('file:')
    ? abrirPglite(path.resolve(/*turbopackIgnore: true*/ process.cwd(), url.slice('file:'.length)))
    : Promise.resolve({ db: drizzle(neon(url), { schema }), fechar: async () => {} })
  const novo = { aberto, db: aberto.then(a => a.db) }
  memo = novo
  novo.db.catch(() => {
    if (memo === novo) memo = undefined
  })
  return novo.db
}

async function abrirPglite(caminho: string): Promise<Aberto> {
  // Imports dinâmicos: o caminho do Neon não carrega o WASM do PGlite.
  const { PGlite } = await import('@electric-sql/pglite')
  const { drizzle: drizzlePglite } = await import('drizzle-orm/pglite')
  const { migrate } = await import('drizzle-orm/pglite/migrator')
  const cliente = new PGlite(caminho)
  const instancia = drizzlePglite(cliente, { schema })
  try {
    await migrate(instancia, { migrationsFolder: path.resolve(process.cwd(), 'drizzle') })
  } catch (erro) {
    // getDb descarta o memo em caso de falha; sem fechar aqui, o cliente ficaria aberto sem dono.
    await cliente.close().catch(() => undefined)
    throw erro
  }
  return { db: instancia, fechar: () => cliente.close() }
}

/** Somente para testes: descarta a instância memoizada e fecha o PGlite dela, se houver. */
export async function resetDbParaTestes(): Promise<void> {
  const atual = memo
  if (!atual) return
  memo = undefined
  const aberto = await atual.aberto.catch(() => undefined)
  await aberto?.fechar()
}

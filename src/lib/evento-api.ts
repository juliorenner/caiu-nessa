import { and, count, eq, gt } from 'drizzle-orm'
import type { Db } from '@/db/client'
import { eventos } from '@/db/schema'
import { eventoSchema } from '@/lib/eventos'
import { extrairIp, hashIp } from '@/lib/rate-limit'

export const LIMITE_EVENTOS_POR_HORA = 60
export const JANELA_EVENTOS_MS = 3_600_000

export interface DepsEvento {
  db: Db
  salt: string
  agora?: Date
}

// Não conhece tipo nenhum: valida pelo esquema de src/lib/eventos.ts e grava.
export async function processarEvento(
  corpo: unknown,
  headers: Headers,
  deps: DepsEvento,
): Promise<{ status: 204 | 400 | 429 }> {
  const validacao = eventoSchema.safeParse(corpo)
  if (!validacao.success) return { status: 400 }
  const { tipo, dados } = validacao.data

  const { db, salt, agora = new Date() } = deps
  const ipHash = hashIp(extrairIp(headers), salt)
  const inicio = new Date(agora.getTime() - JANELA_EVENTOS_MS)
  const [{ total }] = await db
    .select({ total: count() })
    .from(eventos)
    .where(and(eq(eventos.ipHash, ipHash), gt(eventos.createdAt, inicio)))
  if (total >= LIMITE_EVENTOS_POR_HORA) return { status: 429 }

  await db.insert(eventos).values({ tipo, dados, ipHash })
  return { status: 204 }
}

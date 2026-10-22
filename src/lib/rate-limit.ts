import { createHash } from 'node:crypto'
import { and, count, eq, gt, isNotNull, lt } from 'drizzle-orm'
import type { Db } from '@/db/client'
import { jogadas } from '@/db/schema'

export const LIMITE_POR_MINUTO = 5
export const JANELA_MS = 60_000
export const TTL_IP_HASH_MS = 3_600_000

export function extrairIp(headers: Headers): string {
  const encaminhado = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (encaminhado) return encaminhado
  const real = headers.get('x-real-ip')?.trim()
  if (real) return real
  return 'desconhecido'
}

export function hashIp(ip: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}

export async function excedeuLimite(db: Db, ipHash: string, agora: Date = new Date()): Promise<boolean> {
  const inicio = new Date(agora.getTime() - JANELA_MS)
  const [{ total }] = await db
    .select({ total: count() })
    .from(jogadas)
    .where(and(eq(jogadas.ipHash, ipHash), gt(jogadas.createdAt, inicio)))
  return total >= LIMITE_POR_MINUTO
}

export async function limparIpHashesExpirados(db: Db, agora: Date = new Date()): Promise<void> {
  const limite = new Date(agora.getTime() - TTL_IP_HASH_MS)
  await db
    .update(jogadas)
    .set({ ipHash: null })
    .where(and(isNotNull(jogadas.ipHash), lt(jogadas.createdAt, limite)))
}

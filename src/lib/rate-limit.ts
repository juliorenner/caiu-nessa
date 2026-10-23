import { createHash } from 'node:crypto'
import { and, count, eq, gt, isNotNull, lt, sql } from 'drizzle-orm'
import type { Db } from '@/db/client'
import { eventos, jogadas } from '@/db/schema'
import type { Respostas } from '@/lib/afirmacoes'

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

export interface NovaJogadaLimitada {
  respostas: Respostas
  acertos: number
  total: number
  acertosEsquerda: number
  acertosDireita: number
  ipHash: string
}

/**
 * Grava a jogada só se o IP tiver menos de LIMITE_POR_MINUTO jogadas na janela, num único statement
 * (o neon-http não tem transações interativas). Devolve false quando o limite foi atingido e nada foi gravado.
 * Sob READ COMMITTED dois statements concorrentes ainda podem ver a mesma contagem; a janela fica restrita
 * a um statement, não eliminada.
 */
export async function inserirDentroDoLimite(
  db: Db,
  jogada: NovaJogadaLimitada,
  agora: Date = new Date(),
): Promise<boolean> {
  const resultado = await db.execute(sql`
    insert into ${jogadas} (respostas, acertos, total, acertos_esquerda, acertos_direita, ip_hash)
    select ${JSON.stringify(jogada.respostas)}::jsonb, ${jogada.acertos}::int, ${jogada.total}::int,
      ${jogada.acertosEsquerda}::int, ${jogada.acertosDireita}::int, ${jogada.ipHash}::text
    where (
      select count(*) from ${jogadas}
      where ip_hash = ${jogada.ipHash}::text
        and created_at > ${agora.toISOString()}::timestamptz - ${JANELA_MS}::int * interval '1 millisecond'
    ) < ${LIMITE_POR_MINUTO}::int
    returning id`)
  // Db é genérico no driver (tipo do resultado desconhecido); neon-http e PGlite devolvem { rows }.
  const { rows } = resultado as { rows: { id: number }[] }
  return rows.length === 1
}

export async function limparIpHashesExpirados(db: Db, agora: Date = new Date()): Promise<void> {
  const limite = new Date(agora.getTime() - TTL_IP_HASH_MS)
  await db
    .update(jogadas)
    .set({ ipHash: null })
    .where(and(isNotNull(jogadas.ipHash), lt(jogadas.createdAt, limite)))
}

export async function limparIpHashesDeEventosExpirados(db: Db, agora: Date = new Date()): Promise<void> {
  const limite = new Date(agora.getTime() - TTL_IP_HASH_MS)
  await db
    .update(eventos)
    .set({ ipHash: null })
    .where(and(isNotNull(eventos.ipHash), lt(eventos.createdAt, limite)))
}

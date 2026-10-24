import { and, count, eq, gt } from 'drizzle-orm'
import type { Db } from '@/db/client'
import { eventos } from '@/db/schema'
import { contribuicaoSchema, issueDaContribuicao } from '@/lib/contribuicao'
import type { CriarIssue, IssueCriada } from '@/lib/github-issues'
import { extrairIp, hashIp, limparIpHashesDeEventosExpirados } from '@/lib/rate-limit'

// Cada envio grava um evento `contribuicao` (sem o texto): é dele que sai o limite por IP.
// Fica fora de TIPOS_DE_EVENTO de propósito: só o servidor grava este tipo, nunca o /api/evento.
export const TIPO_EVENTO_CONTRIBUICAO = 'contribuicao'
export const LIMITE_CONTRIBUICOES_POR_HORA = 5
export const JANELA_CONTRIBUICOES_MS = 3_600_000

export interface DepsContribuicao {
  db: Db
  salt: string
  // Ausente quando GITHUB_ISSUES_TOKEN não está configurado: o envio responde 503.
  criarIssue: CriarIssue | null
  agora?: Date
}

export type RespostaContribuicao =
  | { status: 201; issue: IssueCriada }
  | { status: 400 | 429 | 502 | 503 }

export async function processarContribuicao(
  corpo: unknown,
  headers: Headers,
  deps: DepsContribuicao,
): Promise<RespostaContribuicao> {
  const validacao = contribuicaoSchema.safeParse(corpo)
  if (!validacao.success) return { status: 400 }
  if (!deps.criarIssue) return { status: 503 }

  const { db, salt, agora = new Date() } = deps
  const ipHash = hashIp(extrairIp(headers), salt)
  await limparIpHashesDeEventosExpirados(db, agora)
  const inicio = new Date(agora.getTime() - JANELA_CONTRIBUICOES_MS)
  const [{ total }] = await db
    .select({ total: count() })
    .from(eventos)
    .where(and(eq(eventos.tipo, TIPO_EVENTO_CONTRIBUICAO), eq(eventos.ipHash, ipHash), gt(eventos.createdAt, inicio)))
  if (total >= LIMITE_CONTRIBUICOES_POR_HORA) return { status: 429 }

  let issue: IssueCriada
  try {
    issue = await deps.criarIssue(issueDaContribuicao(validacao.data))
  } catch {
    return { status: 502 }
  }
  await db.insert(eventos).values({
    tipo: TIPO_EVENTO_CONTRIBUICAO,
    dados: { tipo: validacao.data.tipo, issue: issue.numero },
    ipHash,
  })
  return { status: 201, issue }
}

import { avg, count, sql } from 'drizzle-orm'
import type { Db } from '@/db/client'
import { jogadas } from '@/db/schema'
import type { Afirmacao } from '@/lib/afirmacoes'
import { porcentagem } from '@/lib/avaliacao'

export const MINIMO_JOGADAS = 100
const MAXIMO_ACERTOS = 12

export interface Estatisticas {
  totalJogadas: number
  histograma: number[]
  erroPorAfirmacao: Record<string, number>
  mediaEsquerda: number
  mediaDireita: number
}

function umaCasa(valor: number): number {
  return Math.round(valor * 10) / 10
}

export async function obterEstatisticas(db: Db, afirmacoes: Afirmacao[]): Promise<Estatisticas | null> {
  const [resumo] = await db
    .select({
      total: count(),
      mediaEsquerda: avg(jogadas.acertosEsquerda),
      mediaDireita: avg(jogadas.acertosDireita),
    })
    .from(jogadas)
  const totalJogadas = Number(resumo.total)
  if (totalJogadas < MINIMO_JOGADAS) return null

  const porAcertos = await db
    .select({ acertos: jogadas.acertos, quantidade: count() })
    .from(jogadas)
    .groupBy(jogadas.acertos)
  const histograma = Array<number>(MAXIMO_ACERTOS + 1).fill(0)
  for (const { acertos, quantidade } of porAcertos) {
    if (acertos >= 0 && acertos <= MAXIMO_ACERTOS) histograma[acertos] = Number(quantidade)
  }

  const porResposta = await db
    .select({ chave: sql<string>`kv.chave`, valor: sql<string>`kv.valor`, quantidade: count() })
    .from(sql`${jogadas}, jsonb_each_text(${jogadas.respostas}) as kv(chave, valor)`)
    .groupBy(sql`kv.chave`, sql`kv.valor`)
  const vereditoPorId = new Map(afirmacoes.map(a => [a.id, a.veredito]))
  const erros = new Map<string, number>()
  for (const { chave, valor, quantidade } of porResposta) {
    const veredito = vereditoPorId.get(chave)
    if (veredito === undefined || valor === veredito) continue
    erros.set(chave, (erros.get(chave) ?? 0) + Number(quantidade))
  }
  const erroPorAfirmacao = Object.fromEntries(
    afirmacoes.map(a => [a.id, porcentagem(erros.get(a.id) ?? 0, totalJogadas)]),
  )

  return {
    totalJogadas,
    histograma,
    erroPorAfirmacao,
    mediaEsquerda: umaCasa(Number(resumo.mediaEsquerda)),
    mediaDireita: umaCasa(Number(resumo.mediaDireita)),
  }
}

export function percentilAbaixo(histograma: number[], acertos: number): number {
  const total = histograma.reduce((soma, n) => soma + n, 0)
  const abaixo = histograma.slice(0, Math.max(0, acertos)).reduce((soma, n) => soma + n, 0)
  return porcentagem(abaixo, total)
}

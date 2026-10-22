import { sql } from 'drizzle-orm'
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

interface LinhaAgregada {
  total: number
  media_esquerda: string | number | null
  media_direita: string | number | null
  histograma: { acertos: number; quantidade: number }[]
  por_resposta: { chave: string; valor: string; quantidade: number }[]
}

export async function obterEstatisticas(db: Db, afirmacoes: Afirmacao[]): Promise<Estatisticas | null> {
  // Um único statement: todos os agregados leem o mesmo snapshot de jogadas.
  const resultado = await db.execute(sql`
    with base as (
      select acertos, acertos_esquerda, acertos_direita, respostas from ${jogadas}
    )
    select
      (select count(*) from base)::int as total,
      (select avg(acertos_esquerda) from base) as media_esquerda,
      (select avg(acertos_direita) from base) as media_direita,
      (select coalesce(json_agg(json_build_object('acertos', acertos, 'quantidade', quantidade)), '[]'::json)
        from (select acertos, count(*)::int as quantidade from base group by acertos) h) as histograma,
      (select coalesce(json_agg(json_build_object('chave', chave, 'valor', valor, 'quantidade', quantidade)), '[]'::json)
        from (
          select kv.chave, kv.valor, count(*)::int as quantidade
          from base, jsonb_each_text(base.respostas) as kv(chave, valor)
          group by kv.chave, kv.valor
        ) r) as por_resposta`)
  // Db é genérico no driver (tipo do resultado desconhecido); neon-http e PGlite devolvem { rows } com json já parseado.
  const {
    rows: [linha],
  } = resultado as { rows: LinhaAgregada[] }
  const totalJogadas = Number(linha.total)
  if (totalJogadas < MINIMO_JOGADAS) return null

  const histograma = Array<number>(MAXIMO_ACERTOS + 1).fill(0)
  for (const { acertos, quantidade } of linha.histograma) {
    if (acertos >= 0 && acertos <= MAXIMO_ACERTOS) histograma[acertos] = Number(quantidade)
  }

  const vereditoPorId = new Map(afirmacoes.map(a => [a.id, a.veredito]))
  const erros = new Map<string, number>()
  for (const { chave, valor, quantidade } of linha.por_resposta) {
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
    mediaEsquerda: umaCasa(Number(linha.media_esquerda)),
    mediaDireita: umaCasa(Number(linha.media_direita)),
  }
}

export function percentilAbaixo(histograma: number[], acertos: number): number {
  const total = histograma.reduce((soma, n) => soma + n, 0)
  const abaixo = histograma.slice(0, Math.max(0, acertos)).reduce((soma, n) => soma + n, 0)
  return porcentagem(abaixo, total)
}

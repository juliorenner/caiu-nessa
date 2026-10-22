import { sql } from 'drizzle-orm'
import type { Db } from '@/db/client'
import { jogadas } from '@/db/schema'
import { type Afirmacao, TOTAL_AFIRMACOES } from '@/lib/afirmacoes'
import { porcentagem } from '@/lib/avaliacao'

export const MINIMO_JOGADAS = 100
export const MAXIMO_ACERTOS = 12
// Abaixo disso o "% erraram" de uma afirmação é ruído demais para mostrar.
export const MINIMO_POR_AFIRMACAO = 30

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
  aparicoes: { chave: string; quantidade: number }[]
}

export async function obterEstatisticas(db: Db, pool: Afirmacao[]): Promise<Estatisticas | null> {
  // Um único statement: todos os agregados leem o mesmo snapshot de jogadas.
  // Ranking, histograma e médias só comparam rodadas de 12; o erro por afirmação usa todas as rodadas.
  const resultado = await db.execute(sql`
    with base12 as (
      select acertos, acertos_esquerda, acertos_direita from ${jogadas} where total = ${TOTAL_AFIRMACOES}
    ),
    todas as (
      select respostas from ${jogadas}
    )
    select
      (select count(*) from base12)::int as total,
      (select avg(acertos_esquerda) from base12) as media_esquerda,
      (select avg(acertos_direita) from base12) as media_direita,
      (select coalesce(json_agg(json_build_object('acertos', acertos, 'quantidade', quantidade)), '[]'::json)
        from (select acertos, count(*)::int as quantidade from base12 group by acertos) h) as histograma,
      (select coalesce(json_agg(json_build_object('chave', chave, 'valor', valor, 'quantidade', quantidade)), '[]'::json)
        from (
          select kv.chave, kv.valor, count(*)::int as quantidade
          from todas, jsonb_each_text(todas.respostas) as kv(chave, valor)
          group by kv.chave, kv.valor
        ) r) as por_resposta,
      (select coalesce(json_agg(json_build_object('chave', chave, 'quantidade', quantidade)), '[]'::json)
        from (
          select k.chave, count(*)::int as quantidade
          from todas, jsonb_object_keys(todas.respostas) as k(chave)
          group by k.chave
        ) a) as aparicoes`)
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

  const vereditoPorId = new Map(pool.map(a => [a.id, a.veredito]))
  const erros = new Map<string, number>()
  for (const { chave, valor, quantidade } of linha.por_resposta) {
    const veredito = vereditoPorId.get(chave)
    if (veredito === undefined || valor === veredito) continue
    erros.set(chave, (erros.get(chave) ?? 0) + Number(quantidade))
  }
  const aparicoes = new Map(linha.aparicoes.map(({ chave, quantidade }) => [chave, Number(quantidade)]))
  // Cada afirmação é medida pelas rodadas em que apareceu; abaixo do mínimo fica de fora.
  // Object.fromEntries cria propriedades próprias: um id "__proto__" não vira atribuição de protótipo.
  const erroPorAfirmacao: Record<string, number> = Object.fromEntries(
    pool
      .map(({ id }) => [id, aparicoes.get(id) ?? 0] as const)
      .filter(([, vezes]) => vezes >= MINIMO_POR_AFIRMACAO)
      .map(([id, vezes]) => [id, porcentagem(erros.get(id) ?? 0, vezes)]),
  )

  return {
    totalJogadas,
    histograma,
    erroPorAfirmacao,
    mediaEsquerda: umaCasa(Number(linha.media_esquerda)),
    mediaDireita: umaCasa(Number(linha.media_direita)),
  }
}

// Rotas públicas sem limite de taxa (página do quiz, /api/rodada) leem daqui: no máximo uma agregação por minuto.
// A rota de resultado continua chamando obterEstatisticas direto, para a pessoa ver a própria jogada contada.
export const CACHE_ESTATISTICAS_MS = 60_000

let cache: { valor: Estatisticas | null; expiraEm: number } | null = null

export async function obterEstatisticasComCache(
  db: Db,
  pool: Afirmacao[],
  agora: Date = new Date(),
): Promise<Estatisticas | null> {
  if (cache && agora.getTime() < cache.expiraEm) return cache.valor
  const valor = await obterEstatisticas(db, pool)
  cache = { valor, expiraEm: agora.getTime() + CACHE_ESTATISTICAS_MS }
  return valor
}

export function limparCacheEstatisticas(): void {
  cache = null
}

export function percentilAbaixo(histograma: number[], acertos: number): number {
  const total = histograma.reduce((soma, n) => soma + n, 0)
  const abaixo = histograma.slice(0, Math.max(0, acertos)).reduce((soma, n) => soma + n, 0)
  return porcentagem(abaixo, total)
}

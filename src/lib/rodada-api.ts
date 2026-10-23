import { z } from 'zod'
import type { Db } from '@/db/client'
import { type Afirmacao, type AfirmacaoNoQuiz, semLado, sortearRodada } from '@/lib/afirmacoes'
import { obterEstatisticasComCache } from '@/lib/estatisticas'
import { COMPOSICAO_EXTRA } from '@/lib/rodadas'

// Ids desconhecidos em `vistas` são simplesmente ignorados pelo sorteio.
export const corpoRodadaSchema = z.object({ vistas: z.array(z.string().min(1)).max(500) })

export interface RespostaRodada {
  // null quando o pool, sem as vistas, não fecha mais uma rodada.
  afirmacoes: AfirmacaoNoQuiz[] | null
  erroPorAfirmacao: Record<string, number> | null
}

export interface DepsRodada {
  db: Db
  // O pool inteiro, jogável ou não; o sorteio só usa os jogáveis.
  pool: Afirmacao[]
  aleatorio?: () => number
}

async function erroPorAfirmacao(db: Db, pool: Afirmacao[]): Promise<Record<string, number> | null> {
  try {
    return (await obterEstatisticasComCache(db, pool))?.erroPorAfirmacao ?? null
  } catch (erro) {
    console.error('rodada: estatísticas indisponíveis', erro instanceof Error ? erro.message : String(erro))
    return null
  }
}

export async function processarRodada(
  corpo: unknown,
  deps: DepsRodada,
): Promise<{ status: 200; body: RespostaRodada } | { status: 400; body: { erro: 'pedido_invalido' } }> {
  const validacao = corpoRodadaSchema.safeParse(corpo)
  if (!validacao.success) return { status: 400, body: { erro: 'pedido_invalido' } }

  const { db, pool, aleatorio } = deps
  const rodada = sortearRodada(pool, COMPOSICAO_EXTRA, validacao.data.vistas, aleatorio)
  if (!rodada) return { status: 200, body: { afirmacoes: null, erroPorAfirmacao: null } }
  return {
    status: 200,
    body: { afirmacoes: rodada.map(semLado), erroPorAfirmacao: await erroPorAfirmacao(db, pool) },
  }
}

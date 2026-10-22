import { z } from 'zod'
import type { Db } from '@/db/client'
import { type Afirmacao, TOTAL_AFIRMACOES, VEREDITOS, ehRodadaBalanceada } from '@/lib/afirmacoes'
import { type Avaliacao, gerarAvaliacao } from '@/lib/avaliacao'
import { type Estatisticas, obterEstatisticas, percentilAbaixo } from '@/lib/estatisticas'
import { type Resultado, calcularResultado } from '@/lib/pontuacao'
import { extrairIp, hashIp, inserirDentroDoLimite, limparIpHashesExpirados } from '@/lib/rate-limit'

export const corpoSchema = z.object({ respostas: z.record(z.string(), z.enum(VEREDITOS)) })

export interface RespostaResultado {
  resultado: Resultado
  avaliacao: Avaliacao
  estatisticas: Estatisticas | null
  percentilAbaixo: number | null
  // true só quando a consulta de estatísticas falhou depois de gravar a jogada.
  estatisticasIndisponiveis: boolean
}

export interface Deps {
  db: Db
  // O pool inteiro, jogável ou não; itens com observacao ficam fora do jogo.
  pool: Afirmacao[]
  salt: string
  agora?: Date
}

// Devolve a rodada respondida (itens do pool na ordem do pool) ou null se as chaves não formam uma rodada válida.
function rodadaRespondida(respostas: Record<string, unknown>, pool: Afirmacao[]): Afirmacao[] | null {
  const jogaveis = new Set(pool.filter(a => a.observacao === undefined).map(a => a.id))
  const chaves = Object.keys(respostas)
  if (!chaves.every(chave => jogaveis.has(chave))) return null
  const rodada = pool.filter(a => Object.hasOwn(respostas, a.id))
  return ehRodadaBalanceada(rodada) ? rodada : null
}

export async function processarResultado(
  corpo: unknown,
  headers: Headers,
  deps: Deps,
): Promise<
  | { status: 200; body: RespostaResultado }
  | { status: 400 | 429; body: { erro: 'respostas_invalidas' | 'muitas_jogadas' } }
> {
  const { db, pool, salt, agora = new Date() } = deps
  const validacao = corpoSchema.safeParse(corpo)
  const rodada = validacao.success ? rodadaRespondida(validacao.data.respostas, pool) : null
  if (!validacao.success || !rodada) {
    return { status: 400, body: { erro: 'respostas_invalidas' } }
  }
  const { respostas } = validacao.data

  const ipHash = hashIp(extrairIp(headers), salt)
  await limparIpHashesExpirados(db, agora)

  const resultado = calcularResultado(rodada, respostas)
  const gravada = await inserirDentroDoLimite(
    db,
    {
      respostas,
      acertos: resultado.acertos,
      total: resultado.total,
      acertosEsquerda: resultado.acertosEsquerda,
      acertosDireita: resultado.acertosDireita,
      ipHash,
    },
    agora,
  )
  if (!gravada) return { status: 429, body: { erro: 'muitas_jogadas' } }

  // A jogada já foi gravada: se as estatísticas falharem, o jogador não deve ser mandado tentar de novo.
  let estatisticas: Estatisticas | null = null
  let estatisticasIndisponiveis = false
  try {
    estatisticas = await obterEstatisticas(db, pool)
  } catch (erro) {
    estatisticasIndisponiveis = true
    console.error('resultado: estatísticas indisponíveis', erro instanceof Error ? erro.message : String(erro))
  }
  return {
    status: 200,
    body: {
      resultado,
      avaliacao: gerarAvaliacao(resultado),
      estatisticas,
      // O ranking só compara rodadas de 12.
      percentilAbaixo:
        estatisticas && resultado.total === TOTAL_AFIRMACOES
          ? percentilAbaixo(estatisticas.histograma, resultado.acertos)
          : null,
      estatisticasIndisponiveis,
    },
  }
}

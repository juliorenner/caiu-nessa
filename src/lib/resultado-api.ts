import { z } from 'zod'
import type { Db } from '@/db/client'
import { type Afirmacao, VEREDITOS } from '@/lib/afirmacoes'
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
}

export interface Deps {
  db: Db
  afirmacoes: Afirmacao[]
  salt: string
  agora?: Date
}

function idsConferem(respostas: Record<string, unknown>, afirmacoes: Afirmacao[]): boolean {
  const chaves = Object.keys(respostas)
  const ids = new Set(afirmacoes.map(a => a.id))
  return chaves.length === ids.size && chaves.every(chave => ids.has(chave))
}

export async function processarResultado(
  corpo: unknown,
  headers: Headers,
  deps: Deps,
): Promise<
  | { status: 200; body: RespostaResultado }
  | { status: 400 | 429; body: { erro: 'respostas_invalidas' | 'muitas_jogadas' } }
> {
  const { db, afirmacoes, salt, agora = new Date() } = deps
  const validacao = corpoSchema.safeParse(corpo)
  if (!validacao.success || !idsConferem(validacao.data.respostas, afirmacoes)) {
    return { status: 400, body: { erro: 'respostas_invalidas' } }
  }
  const { respostas } = validacao.data

  const ipHash = hashIp(extrairIp(headers), salt)
  await limparIpHashesExpirados(db, agora)

  const resultado = calcularResultado(afirmacoes, respostas)
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
  try {
    estatisticas = await obterEstatisticas(db, afirmacoes)
  } catch (erro) {
    console.error('resultado: estatísticas indisponíveis', erro instanceof Error ? erro.message : String(erro))
  }
  return {
    status: 200,
    body: {
      resultado,
      avaliacao: gerarAvaliacao(resultado),
      estatisticas,
      percentilAbaixo: estatisticas ? percentilAbaixo(estatisticas.histograma, resultado.acertos) : null,
    },
  }
}

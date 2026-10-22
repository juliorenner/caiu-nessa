import { z } from 'zod'
import type { Db } from '@/db/client'
import { jogadas } from '@/db/schema'
import { type Afirmacao, VEREDITOS } from '@/lib/afirmacoes'
import { type Avaliacao, gerarAvaliacao } from '@/lib/avaliacao'
import { type Estatisticas, obterEstatisticas, percentilAbaixo } from '@/lib/estatisticas'
import { type Resultado, calcularResultado } from '@/lib/pontuacao'
import { excedeuLimite, extrairIp, hashIp, limparIpHashesExpirados } from '@/lib/rate-limit'

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
  if (await excedeuLimite(db, ipHash, agora)) {
    return { status: 429, body: { erro: 'muitas_jogadas' } }
  }

  const resultado = calcularResultado(afirmacoes, respostas)
  await db.insert(jogadas).values({
    respostas,
    acertos: resultado.acertos,
    total: resultado.total,
    acertosEsquerda: resultado.acertosEsquerda,
    acertosDireita: resultado.acertosDireita,
    ipHash,
  })

  const estatisticas = await obterEstatisticas(db, afirmacoes)
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

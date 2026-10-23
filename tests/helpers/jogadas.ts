import type { Db } from '@/db/client'
import { jogadas } from '@/db/schema'
import { TOTAL_AFIRMACOES } from '@/lib/rodadas'
import { respostasCertas, rodadaPrimeira } from '../fixtures/afirmacoes-validas'

type NovaJogada = typeof jogadas.$inferInsert

export async function inserirJogadas(
  db: Db,
  n: number,
  gerar: (i: number) => Partial<NovaJogada> = () => ({}),
): Promise<void> {
  const linhas: NovaJogada[] = Array.from({ length: n }, (_, i) => ({
    respostas: respostasCertas(rodadaPrimeira),
    acertos: TOTAL_AFIRMACOES,
    total: TOTAL_AFIRMACOES,
    acertosEsquerda: TOTAL_AFIRMACOES / 2,
    acertosDireita: TOTAL_AFIRMACOES / 2,
    ipHash: null,
    ...gerar(i),
  }))
  await db.insert(jogadas).values(linhas)
}

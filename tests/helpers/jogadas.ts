import type { Db } from '@/db/client'
import { jogadas } from '@/db/schema'
import { respostasCertas, rodadaDeOito } from '../fixtures/afirmacoes-validas'

type NovaJogada = typeof jogadas.$inferInsert

export async function inserirJogadas(
  db: Db,
  n: number,
  gerar: (i: number) => Partial<NovaJogada> = () => ({}),
): Promise<void> {
  const linhas: NovaJogada[] = Array.from({ length: n }, (_, i) => ({
    respostas: respostasCertas(rodadaDeOito),
    acertos: 8,
    total: 8,
    acertosEsquerda: 4,
    acertosDireita: 4,
    ipHash: null,
    ...gerar(i),
  }))
  await db.insert(jogadas).values(linhas)
}

import type { Db } from '@/db/client'
import { jogadas } from '@/db/schema'
import { todasCertas } from '../fixtures/afirmacoes-validas'

type NovaJogada = typeof jogadas.$inferInsert

export async function inserirJogadas(
  db: Db,
  n: number,
  gerar: (i: number) => Partial<NovaJogada> = () => ({}),
): Promise<void> {
  const linhas: NovaJogada[] = Array.from({ length: n }, (_, i) => ({
    respostas: todasCertas,
    acertos: 12,
    total: 12,
    acertosEsquerda: 6,
    acertosDireita: 6,
    ipHash: null,
    ...gerar(i),
  }))
  await db.insert(jogadas).values(linhas)
}

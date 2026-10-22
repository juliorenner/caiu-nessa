import { expect, it } from 'vitest'
import { jogadas } from '@/db/schema'
import { criarDbTeste } from '../helpers/db'

it('insere e lê uma jogada com as colunas do modelo', async () => {
  const db = await criarDbTeste()
  await db.insert(jogadas).values({
    respostas: { e1: 'verdadeiro' },
    acertos: 1,
    total: 12,
    acertosEsquerda: 1,
    acertosDireita: 0,
    ipHash: 'abc',
  })
  const linhas = await db.select().from(jogadas)
  expect(linhas).toHaveLength(1)
  expect(linhas[0].createdAt).toBeInstanceOf(Date)
  expect(linhas[0].ipHash).toBe('abc')
})

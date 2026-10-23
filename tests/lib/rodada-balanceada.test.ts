import { expect, it } from 'vitest'
import { contarPorPar, ehRodadaBalanceada, type Afirmacao } from '@/lib/afirmacoes'
import { afirmacoesValidas, rodadaPrimeira, rodadaDeSeis } from '../fixtures/afirmacoes-validas'

it('primeira rodada (2/2/1 por lado) é balanceada', () => expect(ehRodadaBalanceada(rodadaPrimeira)).toBe(true))
it('rodada de 6 com 1 por par é balanceada', () => expect(ehRodadaBalanceada(rodadaDeSeis)).toBe(true))
it('rodada histórica de 12 com 2 por par é balanceada', () => expect(ehRodadaBalanceada(afirmacoesValidas)).toBe(true))
it('7 afirmações, ou 10 fora da composição, não são balanceadas', () => {
  expect(ehRodadaBalanceada(rodadaPrimeira.slice(0, 7))).toBe(false)
  // e1..e6 + d1..d4: 2/2/2 à esquerda e 2/2/0 à direita.
  expect(ehRodadaBalanceada(afirmacoesValidas.slice(0, 10))).toBe(false)
})
it('primeira rodada com 3 falsas de um lado não é balanceada', () => {
  const desbalanceada: Afirmacao[] = rodadaPrimeira.map((a) => (a.id === 'e5' ? { ...a, veredito: 'falso' } : a))
  expect(desbalanceada).toHaveLength(10)
  expect(ehRodadaBalanceada(desbalanceada)).toBe(false)
})
it('12 com 3 falsas de um lado não é balanceada', () => {
  const desbalanceada: Afirmacao[] = afirmacoesValidas.map((a) => (a.id === 'e5' ? { ...a, veredito: 'falso' } : a))
  expect(ehRodadaBalanceada(desbalanceada)).toBe(false)
})
it('aceita a lista de composições como parâmetro', () => {
  expect(ehRodadaBalanceada(rodadaPrimeira, [{ verdadeiro: 1, falso: 1, enganoso: 1 }])).toBe(false)
  expect(ehRodadaBalanceada(rodadaDeSeis, [{ verdadeiro: 1, falso: 1, enganoso: 1 }])).toBe(true)
})
it('contarPorPar da rodada de 6 tem seis pares com 1', () => {
  const contagem = contarPorPar(rodadaDeSeis)
  expect(contagem.size).toBe(6)
  expect([...contagem.values()]).toEqual([1, 1, 1, 1, 1, 1])
  expect([...contagem.keys()]).toEqual([
    'esquerda:verdadeiro', 'esquerda:falso', 'esquerda:enganoso', 'direita:verdadeiro', 'direita:falso', 'direita:enganoso',
  ])
})

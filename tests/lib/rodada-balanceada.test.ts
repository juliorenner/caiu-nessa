import { expect, it } from 'vitest'
import { contarPorPar, ehRodadaBalanceada, type Afirmacao } from '@/lib/afirmacoes'
import { afirmacoesValidas, rodadaDeOito, rodadaDeSeis } from '../fixtures/afirmacoes-validas'

it('rodada de 8 com 1/2/1 por lado é balanceada', () => expect(ehRodadaBalanceada(rodadaDeOito)).toBe(true))
it('rodada de 6 com 1 por par é balanceada', () => expect(ehRodadaBalanceada(rodadaDeSeis)).toBe(true))
it('rodada histórica de 12 com 2 por par é balanceada', () => expect(ehRodadaBalanceada(afirmacoesValidas)).toBe(true))
it('7 e 10 afirmações não são balanceadas', () => {
  expect(ehRodadaBalanceada(rodadaDeOito.slice(0, 7))).toBe(false)
  expect(ehRodadaBalanceada(afirmacoesValidas.slice(0, 10))).toBe(false)
})
it('8 com 3 falsas de um lado não é balanceada', () => {
  const desbalanceada: Afirmacao[] = rodadaDeOito.map((a) => (a.id === 'e5' ? { ...a, veredito: 'falso' } : a))
  expect(desbalanceada).toHaveLength(8)
  expect(ehRodadaBalanceada(desbalanceada)).toBe(false)
})
it('12 com 3 falsas de um lado não é balanceada', () => {
  const desbalanceada: Afirmacao[] = afirmacoesValidas.map((a) => (a.id === 'e5' ? { ...a, veredito: 'falso' } : a))
  expect(ehRodadaBalanceada(desbalanceada)).toBe(false)
})
it('aceita a lista de composições como parâmetro', () => {
  expect(ehRodadaBalanceada(rodadaDeOito, [{ verdadeiro: 1, falso: 1, enganoso: 1 }])).toBe(false)
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

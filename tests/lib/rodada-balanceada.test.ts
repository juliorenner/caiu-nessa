import { expect, it } from 'vitest'
import { contarPorPar, ehRodadaBalanceada, type Afirmacao } from '@/lib/afirmacoes'
import { afirmacoesValidas, rodadaDeSeis } from '../fixtures/afirmacoes-validas'

it('rodada de 12 com 2 por par é balanceada', () => expect(ehRodadaBalanceada(afirmacoesValidas)).toBe(true))
it('rodada de 6 com 1 por par é balanceada', () => expect(ehRodadaBalanceada(rodadaDeSeis)).toBe(true))
it('11 afirmações não é balanceada', () => expect(ehRodadaBalanceada(afirmacoesValidas.slice(0, 11))).toBe(false))
it('12 com 3 falsas de um lado não é balanceada', () => {
  const desbalanceada: Afirmacao[] = afirmacoesValidas.map((a) => (a.id === 'e5' ? { ...a, veredito: 'falso' } : a))
  expect(ehRodadaBalanceada(desbalanceada)).toBe(false)
})
it('contarPorPar da rodada de 6 tem seis pares com 1', () => {
  const contagem = contarPorPar(rodadaDeSeis)
  expect(contagem.size).toBe(6)
  expect([...contagem.values()]).toEqual([1, 1, 1, 1, 1, 1])
  expect([...contagem.keys()]).toEqual([
    'esquerda:verdadeiro', 'esquerda:falso', 'esquerda:enganoso', 'direita:verdadeiro', 'direita:falso', 'direita:enganoso',
  ])
})

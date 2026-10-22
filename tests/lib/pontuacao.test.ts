import { expect, it } from 'vitest'
import { calcularResultado, ehQuase } from '@/lib/pontuacao'
import { afirmacoesValidas, todasCertas } from '../fixtures/afirmacoes-validas'

it('12 acertos quando todas as respostas batem com o veredito', () => {
  expect(calcularResultado(afirmacoesValidas, todasCertas)).toEqual({
    acertos: 12, total: 12, acertosEsquerda: 6, acertosDireita: 6, acreditadasEsquerda: 0, acreditadasDireita: 0,
    desconfiadasEsquerda: 0, desconfiadasDireita: 0, grauErradoEsquerda: 0, grauErradoDireita: 0 })
})
it('conta falsas e enganosas acreditadas por lado', () => {
  const r = calcularResultado(afirmacoesValidas, { ...todasCertas, e4: 'verdadeiro', e5: 'verdadeiro', d6: 'verdadeiro' })
  expect(r.acertos).toBe(9); expect(r.acreditadasEsquerda).toBe(2); expect(r.acreditadasDireita).toBe(1)
})
it('confundir falso com enganoso é erro, não acreditou', () => {
  const r = calcularResultado(afirmacoesValidas, { ...todasCertas, e3: 'enganoso', e5: 'falso' })
  expect(r.acertos).toBe(10); expect(r.acreditadasEsquerda).toBe(0)
})
it('conta verdades desconfiadas por lado', () => {
  const r = calcularResultado(afirmacoesValidas, { ...todasCertas, e1: 'falso', d2: 'enganoso' })
  expect(r.acertos).toBe(10); expect(r.desconfiadasEsquerda).toBe(1); expect(r.desconfiadasDireita).toBe(1)
  expect(r.acreditadasEsquerda + r.acreditadasDireita).toBe(0)
})
it('conta grau errado (falso↔enganoso) por lado', () => {
  const r = calcularResultado(afirmacoesValidas, { ...todasCertas, e3: 'enganoso', d5: 'falso', d6: 'falso' })
  expect(r.acertos).toBe(9); expect(r.grauErradoEsquerda).toBe(1); expect(r.grauErradoDireita).toBe(2)
  expect(r.acreditadasEsquerda + r.acreditadasDireita).toBe(0)
  expect(r.desconfiadasEsquerda + r.desconfiadasDireita).toBe(0)
})
it('ehQuase só para falso↔enganoso', () => {
  expect(ehQuase('falso', 'enganoso')).toBe(true); expect(ehQuase('enganoso', 'falso')).toBe(true)
  expect(ehQuase('verdadeiro', 'falso')).toBe(false); expect(ehQuase('falso', 'falso')).toBe(false)
  expect(ehQuase('verdadeiro', 'enganoso')).toBe(false); expect(ehQuase('enganoso', 'verdadeiro')).toBe(false)
})
it('resposta ausente conta como erro', () => {
  const { e1: _omitida, ...semE1 } = todasCertas
  const r = calcularResultado(afirmacoesValidas, semE1)
  expect(r.acertos).toBe(11)
  expect(r.acreditadasEsquerda + r.desconfiadasEsquerda + r.grauErradoEsquerda).toBe(0)
})

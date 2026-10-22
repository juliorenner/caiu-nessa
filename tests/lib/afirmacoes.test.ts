import { describe, expect, it } from 'vitest'
import { embaralhar, fonteEhPermitida, validarAfirmacoes } from '@/lib/afirmacoes'
import { afirmacoesValidas } from '../fixtures/afirmacoes-validas'

describe('validarAfirmacoes', () => {
  it('aceita 12 afirmações na proporção 6/6 e 2/2/2', () => {
    expect(validarAfirmacoes(afirmacoesValidas)).toHaveLength(12)
  })
  it('rejeita total diferente de 12', () => {
    expect(() => validarAfirmacoes(afirmacoesValidas.slice(0, 11))).toThrow(/12/)
  })
  it('rejeita 3 falsas de um lado', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'e1' ? { ...a, veredito: 'falso' as const } : a)
    expect(() => validarAfirmacoes(alterada)).toThrow(/esquerda/)
  })
  it('rejeita id duplicado', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'e2' ? { ...a, id: 'e1' } : a)
    expect(() => validarAfirmacoes(alterada)).toThrow(/duplicad/)
  })
  it('rejeita veredito fora do enum', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'e1' ? { ...a, veredito: 'parcialmente' } : a)
    expect(() => validarAfirmacoes(alterada)).toThrow(/veredito/)
  })
  it('rejeita fonte fora da lista de agências', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'd1' ? { ...a, fonte_url: 'https://exemplo.com/x' } : a)
    expect(() => validarAfirmacoes(alterada)).toThrow(/fonte/)
  })
  it('rejeita data_checagem impossível (2026-02-31)', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'd1' ? { ...a, data_checagem: '2026-02-31' } : a)
    expect(() => validarAfirmacoes(alterada)).toThrow(/data_checagem/)
  })
  it('rejeita data_checagem fora de YYYY-MM-DD', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'd1' ? { ...a, data_checagem: '01/10/2026' } : a)
    expect(() => validarAfirmacoes(alterada)).toThrow(/data_checagem/)
  })
})
describe('fonteEhPermitida', () => {
  it.each([
    ['https://www.aosfatos.org/noticias/x', true],
    ['https://lupa.uol.com.br/jornalismo/2026/x', true],
    ['https://projetocomprova.com.br/publicacoes/x', true],
    ['https://g1.globo.com/fato-ou-fake/noticia/2026/x.ghtml', true],
    ['https://g1.globo.com/politica/noticia/x.ghtml', false],
    ['https://g1.globo.com/fato-ou-fakery/x.ghtml', false],
    ['https://www.estadao.com.br/estadao-verifica/x/', true],
    ['https://www.estadao.com.br/politica/x/', false],
    ['http://aosfatos.org/x', false], // https only
  ])('%s -> %s', (url, esperado) => expect(fonteEhPermitida(url)).toBe(esperado))
})
describe('embaralhar', () => {
  it('mantém os mesmos itens e não muta a entrada', () => {
    const entrada = [1, 2, 3, 4]
    const saida = embaralhar(entrada, () => 0.5)
    expect(saida).toEqual([1, 4, 2, 3])
    expect(saida).toHaveLength(4); expect(saida.sort()).toEqual([1, 2, 3, 4]); expect(entrada).toEqual([1, 2, 3, 4])
  })
})

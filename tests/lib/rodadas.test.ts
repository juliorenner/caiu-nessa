import { describe, expect, it } from 'vitest'
import {
  COMPOSICAO_EXTRA,
  COMPOSICAO_PRIMEIRA,
  COMPOSICOES_HISTORICAS,
  composicaoDoTamanho,
  descricaoDoAlcance,
  descricaoDaComposicao,
  MAXIMO_ACERTOS,
  MINIMO_POR_PAR,
  PESO_POR_ALCANCE,
  PESOS_DA_PRIMEIRA,
  porLinha,
  TAMANHOS_ACEITOS,
  tamanhoDa,
  TOTAL_AFIRMACOES,
} from '@/lib/rodadas'

describe('rodadas', () => {
  it('primeira rodada tem 10 afirmações e é o máximo de acertos', () => {
    expect(TOTAL_AFIRMACOES).toBe(10)
    expect(MAXIMO_ACERTOS).toBe(TOTAL_AFIRMACOES)
  })
  it('tamanhoDa soma os dois lados', () => {
    expect(tamanhoDa(COMPOSICAO_PRIMEIRA)).toBe(10)
    expect(tamanhoDa(COMPOSICAO_EXTRA)).toBe(6)
    expect(COMPOSICOES_HISTORICAS.map(tamanhoDa)).toEqual([8, 12])
  })
  it('mínimo do pool por par é o maior pedido de cada veredito entre as rodadas atuais', () => {
    expect(MINIMO_POR_PAR).toEqual({ verdadeiro: 2, falso: 2, enganoso: 1 })
  })
  it('tamanhos aceitos (atuais + históricos, sem repetição)', () => {
    expect(TAMANHOS_ACEITOS).toEqual([10, 6, 8, 12])
    expect(new Set(TAMANHOS_ACEITOS).size).toBe(TAMANHOS_ACEITOS.length)
  })
  it('composicaoDoTamanho acha atuais e históricas; null para o resto', () => {
    expect(composicaoDoTamanho(10)).toEqual(COMPOSICAO_PRIMEIRA)
    expect(composicaoDoTamanho(6)).toEqual(COMPOSICAO_EXTRA)
    expect(composicaoDoTamanho(8)).toEqual({ verdadeiro: 1, falso: 2, enganoso: 1 })
    expect(composicaoDoTamanho(12)).toEqual({ verdadeiro: 2, falso: 2, enganoso: 2 })
    expect(composicaoDoTamanho(7)).toBeNull()
    expect(composicaoDoTamanho(9)).toBeNull()
  })
  it('porLinha é o maior divisor do total que cabe em 6', () => {
    expect(porLinha(10)).toBe(5)
    expect(porLinha(8)).toBe(4)
    expect(porLinha(6)).toBe(6)
    expect(porLinha(12)).toBe(6)
  })
  it('descricaoDaComposicao usa singular e plural certos', () => {
    expect(descricaoDaComposicao(COMPOSICAO_PRIMEIRA)).toBe('2 verdadeiras, 2 falsas e 1 enganosa')
    expect(descricaoDaComposicao({ verdadeiro: 1, falso: 2, enganoso: 1 })).toBe('1 verdadeira, 2 falsas e 1 enganosa')
    expect(descricaoDaComposicao(COMPOSICAO_EXTRA)).toBe('1 verdadeira, 1 falsa e 1 enganosa')
    expect(descricaoDaComposicao({ verdadeiro: 2, falso: 2, enganoso: 2 })).toBe('2 verdadeiras, 2 falsas e 2 enganosas')
  })
  it('peso por alcance: 1, 2 e 4; a primeira rodada usa esses pesos', () => {
    expect(PESO_POR_ALCANCE).toEqual({ 1: 1, 2: 2, 3: 4 })
    expect(PESOS_DA_PRIMEIRA).toBe(PESO_POR_ALCANCE)
  })
  it('descricaoDoAlcance descreve o critério de cada nível', () => {
    expect(descricaoDoAlcance(3)).toBe('Alcance 3: debate ou entrevista de TV nacional, checada por duas ou mais agências')
    expect(descricaoDoAlcance(2)).toBe('Alcance 2: debate ou entrevista de TV nacional, checada por uma agência')
    expect(descricaoDoAlcance(1)).toBe('Alcance 1: o resto (post, live, podcast, fala avulsa)')
  })
})

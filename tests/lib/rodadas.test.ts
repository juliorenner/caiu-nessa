import { describe, expect, it } from 'vitest'
import {
  COMPOSICAO_EXTRA,
  COMPOSICAO_PRIMEIRA,
  COMPOSICOES_HISTORICAS,
  composicaoDoTamanho,
  descricaoDaComposicao,
  MAXIMO_ACERTOS,
  MINIMO_POR_PAR,
  porLinha,
  TAMANHOS_ACEITOS,
  tamanhoDa,
  TOTAL_AFIRMACOES,
} from '@/lib/rodadas'

describe('rodadas', () => {
  it('primeira rodada tem 8 afirmações e é o máximo de acertos', () => {
    expect(TOTAL_AFIRMACOES).toBe(8)
    expect(MAXIMO_ACERTOS).toBe(TOTAL_AFIRMACOES)
  })
  it('tamanhoDa soma os dois lados', () => {
    expect(tamanhoDa(COMPOSICAO_PRIMEIRA)).toBe(8)
    expect(tamanhoDa(COMPOSICAO_EXTRA)).toBe(6)
    expect(tamanhoDa(COMPOSICOES_HISTORICAS[0])).toBe(12)
  })
  it('mínimo do pool por par é o maior pedido de cada veredito entre as rodadas atuais', () => {
    expect(MINIMO_POR_PAR).toEqual({ verdadeiro: 1, falso: 2, enganoso: 1 })
  })
  it('tamanhos aceitos (atuais + históricos, sem repetição)', () => {
    expect(TAMANHOS_ACEITOS).toEqual([8, 6, 12])
    expect(new Set(TAMANHOS_ACEITOS).size).toBe(TAMANHOS_ACEITOS.length)
  })
  it('composicaoDoTamanho acha atuais e históricas; null para o resto', () => {
    expect(composicaoDoTamanho(8)).toEqual(COMPOSICAO_PRIMEIRA)
    expect(composicaoDoTamanho(6)).toEqual(COMPOSICAO_EXTRA)
    expect(composicaoDoTamanho(12)).toEqual({ verdadeiro: 2, falso: 2, enganoso: 2 })
    expect(composicaoDoTamanho(7)).toBeNull()
    expect(composicaoDoTamanho(10)).toBeNull()
  })
  it('porLinha é o maior divisor do total que cabe em 6', () => {
    expect(porLinha(8)).toBe(4)
    expect(porLinha(6)).toBe(6)
    expect(porLinha(12)).toBe(6)
  })
  it('descricaoDaComposicao usa singular e plural certos', () => {
    expect(descricaoDaComposicao(COMPOSICAO_PRIMEIRA)).toBe('1 verdadeira, 2 falsas e 1 enganosa')
    expect(descricaoDaComposicao(COMPOSICAO_EXTRA)).toBe('1 verdadeira, 1 falsa e 1 enganosa')
    expect(descricaoDaComposicao({ verdadeiro: 2, falso: 2, enganoso: 2 })).toBe('2 verdadeiras, 2 falsas e 2 enganosas')
  })
})

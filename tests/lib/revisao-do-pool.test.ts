import { describe, expect, it } from 'vitest'
import type { Afirmacao } from '@/lib/afirmacoes'
import { compararPools, LIMITES_DA_REVISAO, resumirRevisao } from '@/lib/revisao-do-pool'
import { afirmacoesValidas } from '../fixtures/afirmacoes-validas'

const antes = afirmacoesValidas

function nova(id: string, lado: Afirmacao['lado'], veredito: Afirmacao['veredito'] = 'falso'): Afirmacao {
  return { ...afirmacoesValidas[0], id, lado, veredito }
}

describe('compararPools', () => {
  it('limites: 6 novas por rodada, 3 por lado', () => {
    expect(LIMITES_DA_REVISAO).toEqual({ novasPorRodada: 6, novasPorLado: 3 })
  })

  it('pool igual: sem problemas', () => {
    expect(compararPools(antes, antes)).toEqual([])
  })

  it('uma nova válida, ou uma existente marcada fora do jogo: sem problemas', () => {
    expect(compararPools(antes, [...antes, nova('a1b2c3d4', 'direita')])).toEqual([])
    // e6 é a segunda enganosa da esquerda: o mínimo (1) continua atendido.
    const foraDoJogo = antes.map((a) => (a.id === 'e6' ? { ...a, observacao: 'Fora do jogo: a checagem foi retirada do ar.' } : a))
    expect(compararPools(antes, foraDoJogo)).toEqual([])
  })

  it('sete novas, quatro de um lado: dois problemas de volume', () => {
    const novas = ['00000001', '00000002', '00000003', '00000004'].map((id) => nova(id, 'esquerda'))
    novas.push(nova('00000005', 'direita'), nova('00000006', 'direita'), nova('00000007', 'direita'))
    const problemas = compararPools(antes, [...antes, ...novas])
    expect(problemas).toContain('7 novas, limite 6')
    expect(problemas).toContain('4 novas à esquerda, limite 3')
    expect(problemas).toHaveLength(2)
  })

  it('item removido é problema: sair do jogo é por observacao', () => {
    expect(compararPools(antes, antes.filter((a) => a.id !== 'e6'))).toEqual(['removido: e6'])
  })

  it('id novo fora do formato (8 hexadecimais)', () => {
    expect(compararPools(antes, [...antes, nova('ZZ', 'direita')])).toEqual(['id inválido: ZZ'])
    expect(compararPools(antes, [...antes, nova('A1B2C3D4', 'direita')])).toEqual(['id inválido: A1B2C3D4'])
  })

  it('depois inválido para validarPool: um problema com a mensagem dele', () => {
    const semVerdadeiras = antes.map((a) => (['e1', 'e2'].includes(a.id) ? { ...a, veredito: 'enganoso' as const } : a))
    const problemas = compararPools(antes, semVerdadeiras)
    expect(problemas).toHaveLength(1)
    expect(problemas[0]).toMatch(/^Afirmações inválidas/)
  })

  it('item existente não muda de lado', () => {
    const trocado = antes.map((a) => (a.id === 'e6' ? { ...a, lado: 'direita' as const } : a))
    expect(compararPools(antes, trocado)).toEqual(['lado mudou: e6'])
  })

  it('resumirRevisao conta novas e alteradas', () => {
    const depois = [...antes.map((a) => (a.id === 'e1' ? { ...a, explicacao: `${a.explicacao} (atualizada)` } : a)), nova('a1b2c3d4', 'direita')]
    expect(resumirRevisao(antes, depois)).toEqual({ novas: 1, alteradas: 1 })
    expect(resumirRevisao(antes, antes)).toEqual({ novas: 0, alteradas: 0 })
  })

  it('limites podem ser passados', () => {
    expect(compararPools(antes, [...antes, nova('a1b2c3d4', 'direita')], { novasPorRodada: 0, novasPorLado: 0 })).toEqual([
      '1 novas, limite 0',
      '1 novas à direita, limite 0',
    ])
  })
})

import { describe, expect, it } from 'vitest'
import { obterEstatisticas, percentilAbaixo } from '@/lib/estatisticas'
import { afirmacoesValidas, todasCertas } from '../fixtures/afirmacoes-validas'
import { criarDbTeste } from '../helpers/db'
import { inserirJogadas } from '../helpers/jogadas'

describe('obterEstatisticas', () => {
  it('retorna null com 99 jogadas e estatísticas com 100 (gate inclusivo)', async () => {
    const db = await criarDbTeste()
    await inserirJogadas(db, 99)
    expect(await obterEstatisticas(db, afirmacoesValidas)).toBeNull()
    await inserirJogadas(db, 1)
    expect((await obterEstatisticas(db, afirmacoesValidas))?.totalJogadas).toBe(100)
  })

  it('histograma, erro por afirmação e média por lado', async () => {
    const db = await criarDbTeste()
    // 60 jogadas perfeitas; 40 jogadas que erram só e4 (respondem VERDADE numa falsa)
    await inserirJogadas(db, 60)
    await inserirJogadas(db, 40, () => ({
      respostas: { ...todasCertas, e4: 'verdadeiro' },
      acertos: 11,
      acertosEsquerda: 5,
    }))
    const e = (await obterEstatisticas(db, afirmacoesValidas))!
    expect(e.histograma[12]).toBe(60)
    expect(e.histograma[11]).toBe(40)
    expect(e.histograma).toHaveLength(13)
    expect(e.erroPorAfirmacao.e4).toBe(40)
    expect(e.erroPorAfirmacao.e1).toBe(0)
    expect(e.mediaEsquerda).toBe(5.6)
    expect(e.mediaDireita).toBe(6)
  })

  it('ignora ids antigos nas respostas e dá 0 para id sem respostas', async () => {
    const db = await criarDbTeste()
    await inserirJogadas(db, 100, () => ({ respostas: { ...todasCertas, removida: 'falso' } }))
    const e = (await obterEstatisticas(db, afirmacoesValidas))!
    expect(e.erroPorAfirmacao).not.toHaveProperty('removida')
    expect(Object.keys(e.erroPorAfirmacao)).toHaveLength(12)
  })
})

describe('percentilAbaixo', () => {
  it('calcula a porcentagem de jogadas com menos acertos', () => {
    const h = Array(13).fill(0)
    h[12] = 100
    expect(percentilAbaixo(h, 12)).toBe(0) // todo mundo igual
    h[5] = 100
    expect(percentilAbaixo(h, 12)).toBe(50)
    expect(percentilAbaixo(Array(13).fill(0), 7)).toBe(0)
  })
})

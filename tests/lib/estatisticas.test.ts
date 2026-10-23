import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CACHE_ESTATISTICAS_MS,
  limparCacheEstatisticas,
  MINIMO_POR_AFIRMACAO,
  obterEstatisticas,
  obterEstatisticasComCache,
  percentilAbaixo,
} from '@/lib/estatisticas'
import { TOTAL_AFIRMACOES } from '@/lib/rodadas'
import { afirmacoesValidas, respostasCertas, rodadaPrimeira, rodadaDeSeis, todasCertas } from '../fixtures/afirmacoes-validas'

const primeira = respostasCertas(rodadaPrimeira)
const N = TOTAL_AFIRMACOES
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
    // 60 jogadas perfeitas da primeira rodada; 40 que erram só e4 (respondem VERDADE numa falsa)
    await inserirJogadas(db, 60)
    await inserirJogadas(db, 40, () => ({
      respostas: { ...primeira, e4: 'verdadeiro' },
      acertos: N - 1,
      acertosEsquerda: N / 2 - 1,
    }))
    const e = (await obterEstatisticas(db, afirmacoesValidas))!
    expect(e.histograma[N]).toBe(60)
    expect(e.histograma[N - 1]).toBe(40)
    expect(e.histograma).toHaveLength(N + 1)
    expect(e.erroPorAfirmacao.e4).toBe(40)
    expect(e.erroPorAfirmacao.e1).toBe(0)
    // Esquerda: 60 × 5 + 40 × 4 = 460 / 100.
    expect(e.mediaEsquerda).toBe(N / 2 - 0.4)
    expect(e.mediaDireita).toBe(N / 2)
  })

  it('ignora ids antigos nas respostas e deixa de fora id sem respostas', async () => {
    const db = await criarDbTeste()
    const { e1: _, ...semE1 } = primeira
    await inserirJogadas(db, 100, () => ({ respostas: { ...semE1, removida: 'falso' } }))
    const e = (await obterEstatisticas(db, afirmacoesValidas))!
    expect(e.erroPorAfirmacao).not.toHaveProperty('removida')
    expect(e.erroPorAfirmacao).not.toHaveProperty('e1')
    expect(Object.keys(e.erroPorAfirmacao)).toHaveLength(N - 1)
  })

  it('ranking e histograma só contam jogadas da primeira rodada (nem extras de 6, nem históricas de 12)', async () => {
    const db = await criarDbTeste()
    const seis = Object.fromEntries(rodadaDeSeis.map(a => [a.id, a.veredito]))
    await inserirJogadas(db, 100)
    await inserirJogadas(db, 50, () => ({
      respostas: seis,
      acertos: 2,
      total: 6,
      acertosEsquerda: 1,
      acertosDireita: 1,
    }))
    await inserirJogadas(db, 30, () => ({
      respostas: todasCertas,
      acertos: 12,
      total: 12,
      acertosEsquerda: 6,
      acertosDireita: 6,
    }))
    const e = (await obterEstatisticas(db, afirmacoesValidas))!
    expect(e.totalJogadas).toBe(100)
    expect(e.histograma.reduce((s, n) => s + n, 0)).toBe(100)
    expect(e.histograma[N]).toBe(100)
    expect(e.histograma[2]).toBe(0)
    expect(e.mediaEsquerda).toBe(N / 2)
  })

  it('gate de 100 conta só jogadas da primeira rodada', async () => {
    const db = await criarDbTeste()
    await inserirJogadas(db, 99)
    await inserirJogadas(db, 50, () => ({
      respostas: Object.fromEntries(rodadaDeSeis.map(a => [a.id, a.veredito])),
      acertos: 6,
      total: 6,
      acertosEsquerda: 3,
      acertosDireita: 3,
    }))
    expect(await obterEstatisticas(db, afirmacoesValidas)).toBeNull()
  })

  it('% erraram usa aparições por afirmação', async () => {
    const db = await criarDbTeste()
    // e7 (item extra do pool) só aparece em 40 rodadas de 6, errada em 10: 10/40, não 10/140.
    const pool = [...afirmacoesValidas, { ...afirmacoesValidas[0], id: 'e7' }]
    const outrosCinco = Object.fromEntries(rodadaDeSeis.slice(1).map(a => [a.id, a.veredito]))
    await inserirJogadas(db, 100)
    await inserirJogadas(db, 40, i => ({
      respostas: { e7: i < 10 ? 'falso' : 'verdadeiro', ...outrosCinco },
      acertos: i < 10 ? 5 : 6,
      total: 6,
    }))
    const e = (await obterEstatisticas(db, pool))!
    expect(e.erroPorAfirmacao.e7).toBe(25)
    expect(e.erroPorAfirmacao.e1).toBe(0)
  })

  it('afirmação com menos de 30 aparições fica fora de erroPorAfirmacao', async () => {
    expect(MINIMO_POR_AFIRMACAO).toBe(30)
    const db = await criarDbTeste()
    const pool = [...afirmacoesValidas, { ...afirmacoesValidas[0], id: 'e7' }, { ...afirmacoesValidas[0], id: 'e8' }]
    const outrosCinco = Object.fromEntries(rodadaDeSeis.slice(1).map(a => [a.id, a.veredito]))
    await inserirJogadas(db, 100)
    await inserirJogadas(db, 29, () => ({ respostas: { e7: 'falso', ...outrosCinco }, acertos: 5, total: 6 }))
    await inserirJogadas(db, 30, () => ({ respostas: { e8: 'falso', ...outrosCinco }, acertos: 5, total: 6 }))
    const e = (await obterEstatisticas(db, pool))!
    expect(e.erroPorAfirmacao).not.toHaveProperty('e7')
    expect(e.erroPorAfirmacao.e8).toBe(100)
  })

  it('id "__proto__" vira propriedade própria de erroPorAfirmacao', async () => {
    const db = await criarDbTeste()
    const pool = [...afirmacoesValidas, { ...afirmacoesValidas[0], id: '__proto__' }]
    const outrosCinco = Object.fromEntries(rodadaDeSeis.slice(1).map(a => [a.id, a.veredito]))
    await inserirJogadas(db, 100)
    await inserirJogadas(db, 30, () => ({
      respostas: Object.fromEntries([['__proto__', 'falso'], ...Object.entries(outrosCinco)]),
      acertos: 5,
      total: 6,
    }))
    const e = (await obterEstatisticas(db, pool))!
    expect(Object.hasOwn(e.erroPorAfirmacao, '__proto__')).toBe(true)
    expect(Object.getOwnPropertyDescriptor(e.erroPorAfirmacao, '__proto__')?.value).toBe(100)
    expect(Object.getPrototypeOf(e.erroPorAfirmacao)).toBe(Object.prototype)
  })
})

describe('obterEstatisticasComCache', () => {
  beforeEach(() => limparCacheEstatisticas())

  it('consulta o banco uma vez por minuto e guarda também o null', async () => {
    const db = await criarDbTeste()
    const execute = vi.spyOn(db, 'execute')
    const t0 = new Date('2026-10-22T12:00:00Z')
    expect(await obterEstatisticasComCache(db, afirmacoesValidas, t0)).toBeNull()
    await inserirJogadas(db, 100)
    // Ainda dentro do minuto: devolve o null guardado, sem consultar.
    const quaseUmMinuto = new Date(t0.getTime() + CACHE_ESTATISTICAS_MS - 1)
    expect(await obterEstatisticasComCache(db, afirmacoesValidas, quaseUmMinuto)).toBeNull()
    expect(execute).toHaveBeenCalledTimes(1)
    const depois = new Date(t0.getTime() + CACHE_ESTATISTICAS_MS)
    expect((await obterEstatisticasComCache(db, afirmacoesValidas, depois))?.totalJogadas).toBe(100)
    expect(execute).toHaveBeenCalledTimes(2)
  })

  it('limparCacheEstatisticas força nova consulta', async () => {
    const db = await criarDbTeste()
    const execute = vi.spyOn(db, 'execute')
    const t0 = new Date('2026-10-22T12:00:00Z')
    await obterEstatisticasComCache(db, afirmacoesValidas, t0)
    limparCacheEstatisticas()
    await obterEstatisticasComCache(db, afirmacoesValidas, t0)
    expect(execute).toHaveBeenCalledTimes(2)
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

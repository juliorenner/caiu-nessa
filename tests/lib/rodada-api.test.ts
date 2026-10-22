import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Db } from '@/db/client'
import { limparCacheEstatisticas } from '@/lib/estatisticas'
import { processarRodada } from '@/lib/rodada-api'
import { afirmacoesValidas } from '../fixtures/afirmacoes-validas'
import { criarDbTeste } from '../helpers/db'

const deps = async () => ({ db: await criarDbTeste(), pool: afirmacoesValidas })
const porId = new Map(afirmacoesValidas.map(a => [a.id, a]))

describe('processarRodada', () => {
  beforeEach(() => limparCacheEstatisticas())

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('devolve 6 afirmações sem lado, 1 por par, nenhuma vista', async () => {
    const vistas = ['e1', 'd3', 'x9']
    const r = await processarRodada({ vistas }, await deps())
    expect(r.status).toBe(200)
    if (r.status !== 200) return
    const afirmacoes = r.body.afirmacoes
    expect(afirmacoes).toHaveLength(6)
    for (const a of afirmacoes ?? []) expect(a).not.toHaveProperty('lado')
    const pares = (afirmacoes ?? []).map(a => {
      const original = porId.get(a.id)
      return `${original?.lado}:${original?.veredito}`
    })
    expect(new Set(pares).size).toBe(6)
    expect((afirmacoes ?? []).some(a => vistas.includes(a.id))).toBe(false)
    // Abaixo do mínimo de jogadas não há estatísticas.
    expect(r.body.erroPorAfirmacao).toBeNull()
  })

  it('devolve afirmacoes null quando o pool não fecha', async () => {
    const d = await deps()
    const execute = vi.spyOn(d.db, 'execute')
    const r = await processarRodada({ vistas: ['e1', 'e2'] }, d)
    expect(r).toEqual({ status: 200, body: { afirmacoes: null, erroPorAfirmacao: null } })
    expect(execute).not.toHaveBeenCalled()
  })

  it('400 para corpo sem vistas ou com vistas não-string', async () => {
    const d = await deps()
    for (const corpo of [{}, null, { vistas: 'e1' }, { vistas: [1] }, { vistas: [''] }, { vistas: Array(501).fill('e1') }])
      expect(await processarRodada(corpo, d)).toEqual({ status: 400, body: { erro: 'pedido_invalido' } })
  })

  it('erroPorAfirmacao null quando as estatísticas falham', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const db = { execute: () => Promise.reject(new Error('banco caiu')) } as unknown as Db
    const r = await processarRodada({ vistas: [] }, { db, pool: afirmacoesValidas })
    expect(r.status).toBe(200)
    if (r.status !== 200) return
    expect(r.body.afirmacoes).toHaveLength(6)
    expect(r.body.erroPorAfirmacao).toBeNull()
    expect(console.error).toHaveBeenCalledWith('rodada: estatísticas indisponíveis', 'banco caiu')
  })
})

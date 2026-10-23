import { count } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { eventos } from '@/db/schema'
import { JANELA_EVENTOS_MS, LIMITE_EVENTOS_POR_HORA, processarEvento } from '@/lib/evento-api'
import { TTL_IP_HASH_MS, hashIp } from '@/lib/rate-limit'
import { criarDbTeste } from '../helpers/db'

const deps = async () => ({ db: await criarDbTeste(), salt: 's' })
const cab = new Headers({ 'x-forwarded-for': '9.9.9.9' })
const evento = { tipo: 'compartilhar', dados: { modo: 'link', resultado: 'folha' } }

describe('processarEvento', () => {
  it('204 grava tipo, dados e ip_hash', async () => {
    const d = await deps()
    expect(await processarEvento(evento, cab, d)).toEqual({ status: 204 })
    const [linha] = await d.db.select().from(eventos)
    expect(linha.tipo).toBe('compartilhar')
    expect(linha.dados).toEqual({ modo: 'link', resultado: 'folha' })
    expect(linha.ipHash).toBe(hashIp('9.9.9.9', 's'))
    expect(linha.createdAt).toBeInstanceOf(Date)
  })

  it('400 para corpo inválido; nada é gravado', async () => {
    const d = await deps()
    for (const corpo of [null, {}, { tipo: 'visita', dados: {} }, { tipo: 'compartilhar', dados: { modo: 'x' } }])
      expect(await processarEvento(corpo, cab, d)).toEqual({ status: 400 })
    expect(await d.db.select().from(eventos)).toHaveLength(0)
  })

  it('429 acima do limite por hora do mesmo IP; outro IP e a janela seguinte seguem gravando', async () => {
    expect(LIMITE_EVENTOS_POR_HORA).toBe(60)
    expect(JANELA_EVENTOS_MS).toBe(3_600_000)
    const d = await deps()
    for (let i = 0; i < LIMITE_EVENTOS_POR_HORA; i++) expect((await processarEvento(evento, cab, d)).status).toBe(204)
    expect(await processarEvento(evento, cab, d)).toEqual({ status: 429 })
    const [{ linhas }] = await d.db.select({ linhas: count() }).from(eventos)
    expect(linhas).toBe(LIMITE_EVENTOS_POR_HORA)
    expect((await processarEvento(evento, new Headers({ 'x-forwarded-for': '8.8.8.8' }), d)).status).toBe(204)
    const depois = new Date(Date.now() + JANELA_EVENTOS_MS + 1_000)
    expect((await processarEvento(evento, cab, { ...d, agora: depois })).status).toBe(204)
  })

  it('um evento aceito anula ip_hash de eventos com mais de TTL_IP_HASH_MS e mantém o resto', async () => {
    const d = await deps()
    const agora = new Date('2026-10-21T12:00:00Z')
    await d.db.insert(eventos).values([
      { tipo: 'compartilhar', ipHash: 'velho', createdAt: new Date(agora.getTime() - TTL_IP_HASH_MS - 60_000) },
      { tipo: 'compartilhar', ipHash: 'novo', createdAt: new Date(agora.getTime() - TTL_IP_HASH_MS + 60_000) },
    ])
    expect((await processarEvento(evento, cab, { ...d, agora })).status).toBe(204)
    const hashes = (await d.db.select({ ipHash: eventos.ipHash }).from(eventos)).map(l => l.ipHash)
    expect(hashes).toContain('novo')
    expect(hashes).toContain(hashIp('9.9.9.9', 's'))
    expect(hashes).not.toContain('velho')
    expect(hashes).toContain(null)
  })
})

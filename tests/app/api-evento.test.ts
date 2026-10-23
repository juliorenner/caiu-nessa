import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/db/client', () => ({ getDb: vi.fn(() => Promise.reject(new Error('banco fora do ar'))) }))

import { POST } from '@/app/api/evento/route'
import { getDb } from '@/db/client'
import { eventos } from '@/db/schema'
import { criarDbTeste } from '../helpers/db'

const pedido = (corpo: string) => new Request('http://localhost/api/evento', { method: 'POST', body: corpo })

describe('POST /api/evento', () => {
  beforeEach(() => vi.stubEnv('IP_HASH_SALT', 's'))
  afterEach(() => {
    vi.mocked(getDb).mockClear()
    vi.unstubAllEnvs()
  })

  it('JSON inválido ou corpo inválido dá 400 sem corpo e sem abrir o banco', async () => {
    for (const corpo of ['não é json', '{}', '{"tipo":"visita","dados":{}}']) {
      const resposta = await POST(pedido(corpo))
      expect(resposta.status).toBe(400)
      expect(await resposta.text()).toBe('')
    }
    expect(getDb).not.toHaveBeenCalled()
  })

  it('evento válido dá 204 e grava a linha', async () => {
    const db = await criarDbTeste()
    vi.mocked(getDb).mockResolvedValueOnce(db)
    const resposta = await POST(pedido('{"tipo":"compartilhar","dados":{"modo":"baixar","resultado":"clique"}}'))
    expect(resposta.status).toBe(204)
    expect(await db.select().from(eventos)).toHaveLength(1)
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/db/client', () => ({ getDb: vi.fn(() => Promise.reject(new Error('banco fora do ar'))) }))

import { POST } from '@/app/api/rodada/route'
import { getDb } from '@/db/client'

const pedido = (corpo: string) => new Request('http://localhost/api/rodada', { method: 'POST', body: corpo })

describe('POST /api/rodada', () => {
  afterEach(() => vi.mocked(getDb).mockClear())

  it('corpo inválido dá 400 sem abrir o banco, mesmo com o banco fora do ar', async () => {
    for (const corpo of ['{}', '{"vistas":"e1"}', 'não é json']) {
      const resposta = await POST(pedido(corpo))
      expect(resposta.status).toBe(400)
      expect(await resposta.json()).toEqual({ erro: 'pedido_invalido' })
    }
    expect(getDb).not.toHaveBeenCalled()
  })
})

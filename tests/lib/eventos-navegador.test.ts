import { describe, expect, it, vi } from 'vitest'
import type { Evento } from '@/lib/eventos'
import { registrarEvento } from '@/lib/eventos-navegador'

const evento: Evento = { tipo: 'compartilhar', dados: { modo: 'imagem', resultado: 'cancelado' } }

describe('registrarEvento', () => {
  it('envia POST JSON para /api/evento com keepalive', () => {
    const enviar = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    registrarEvento(evento, enviar)
    expect(enviar).toHaveBeenCalledWith('/api/evento', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(evento),
      keepalive: true,
    })
  })

  it('jogador interno não envia nada', () => {
    const enviar = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    registrarEvento(evento, enviar, true)
    expect(enviar).not.toHaveBeenCalled()
  })

  it('nunca lança: rejeição, erro síncrono ou fetch ausente', async () => {
    const rejeita = vi.fn().mockRejectedValue(new Error('rede caiu'))
    expect(() => registrarEvento(evento, rejeita)).not.toThrow()
    await Promise.resolve()
    expect(() =>
      registrarEvento(evento, () => {
        throw new Error('síncrono')
      }),
    ).not.toThrow()
    expect(() => registrarEvento(evento, undefined as unknown as typeof fetch)).not.toThrow()
    vi.stubGlobal('fetch', undefined)
    try {
      expect(() => registrarEvento(evento)).not.toThrow()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})

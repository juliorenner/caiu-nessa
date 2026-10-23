// @vitest-environment node
import { mkdirSync, writeFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))

import Image, { alt, contentType, size } from '@/app/r/[codigo]/opengraph-image'
import { TOTAL_AFIRMACOES } from '@/lib/rodadas'

// Rodada completa do tamanho atual: acerto, erro, acerto, quase, em ciclo.
const G = Array.from({ length: TOTAL_AFIRMACOES }, (_, i) => 'aeaq'[i % 4]).join('')
const CODIGO = `${[...G].filter(l => l === 'a').length}-${TOTAL_AFIRMACOES}-1-caiu-feio-${G}`

describe('/r/[codigo]/opengraph-image', () => {
  it('declara 1200×630 em PNG', () => {
    expect(size).toEqual({ width: 1200, height: 630 })
    expect(contentType).toBe('image/png')
  })

  it('alt fixo, sem revelar nada', () => {
    expect(alt).toBe('Placar de um amigo no Caiu Nessa? E você?')
  })

  it('gera PNG 1200×630 com cache de um dia no navegador e uma semana na CDN', async () => {
    const res = await Image({ params: Promise.resolve({ codigo: CODIGO }) })
    expect(res.headers.get('content-type')).toBe('image/png')
    expect(res.headers.get('cache-control')).toBe('public, max-age=86400, s-maxage=604800')
    const png = Buffer.from(await res.arrayBuffer())
    expect(png.readUInt32BE(16)).toBe(1200)
    expect(png.readUInt32BE(20)).toBe(630)
    // Cópia para conferência visual (fora do repositório versionado).
    mkdirSync('.superpowers/sdd/2026-10-22-link-resultado', { recursive: true })
    writeFileSync('.superpowers/sdd/2026-10-22-link-resultado/og-resultado.png', png)
  })

  it('aceita link antigo de 12 (grade 2×6)', async () => {
    const res = await Image({ params: Promise.resolve({ codigo: '4-12-3-caiu-feio-aeaqeeaeeqea' }) })
    const png = Buffer.from(await res.arrayBuffer())
    expect(png.readUInt32BE(16)).toBe(1200)
    mkdirSync('.superpowers/sdd/2026-10-22-link-resultado', { recursive: true })
    writeFileSync('.superpowers/sdd/2026-10-22-link-resultado/og-resultado-12.png', png)
  })

  it('código inválido cai no notFound', async () => {
    await expect(Image({ params: Promise.resolve({ codigo: '4-7-3-caiu-feio-aeaqeea' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    )
  })
})

// @vitest-environment node
import { mkdirSync, writeFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))

import ImagemConvite, * as ogConvite from '@/app/jogue/opengraph-image'
import ImagemPercentil, * as ogPercentil from '@/app/jogue/[p]/opengraph-image'

const params = (p: string) => Promise.resolve({ p })
// Cópias para conferência visual (fora do repositório versionado).
const DIR = '.superpowers/sdd/2026-10-23-compartilhar-sem-placar'

async function png(res: Response) {
  expect(res.headers.get('content-type')).toBe('image/png')
  const b = Buffer.from(await res.arrayBuffer())
  expect(b.readUInt32BE(16)).toBe(1200)
  expect(b.readUInt32BE(20)).toBe(630)
  return b
}

describe('/jogue/opengraph-image', () => {
  it('prévia 1200×630 sem números', async () => {
    expect(ogConvite.size).toEqual({ width: 1200, height: 630 })
    expect(ogConvite.alt).not.toMatch(/\d/)
    mkdirSync(DIR, { recursive: true })
    writeFileSync(`${DIR}/og-convite.png`, await png(await ImagemConvite()))
  }, 30_000)
})

describe('/jogue/[p]/opengraph-image', () => {
  it('prévia 1200×630 com cache de um dia no navegador e uma semana na CDN', async () => {
    const res = await ImagemPercentil({ params: params('73') })
    expect(res.headers.get('cache-control')).toBe('public, max-age=86400, s-maxage=604800')
    expect(ogPercentil.alt).not.toMatch(/\d/)
    writeFileSync(`${DIR}/og-percentil.png`, await png(res))
  }, 30_000)

  it('fora de 1 a 99: 404', async () => {
    for (const p of ['0', '100', 'x']) await expect(ImagemPercentil({ params: params(p) })).rejects.toThrow('NEXT_NOT_FOUND')
  })
})

// @vitest-environment node
import { mkdirSync, writeFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { GET } from '@/app/convite/route'
import { GET as GET_PERCENTIL } from '@/app/percentil/route'

it('GET /convite: PNG 1080×1920 com o mesmo cache de /cartao', async () => {
  const res = await GET()
  expect(res.status).toBe(200)
  expect(res.headers.get('content-type')).toBe('image/png')
  expect(res.headers.get('cache-control')).toBe('public, max-age=86400, s-maxage=604800')
  const png = Buffer.from(await res.arrayBuffer())
  expect(png.readUInt32BE(16)).toBe(1080)
  expect(png.readUInt32BE(20)).toBe(1920)
  // Cópia para conferência visual (fora do repositório versionado).
  mkdirSync('.superpowers/sdd/2026-10-23-compartilhar-sem-placar', { recursive: true })
  writeFileSync('.superpowers/sdd/2026-10-23-compartilhar-sem-placar/convite.png', png)
})

it('GET /percentil: PNG 1080×1920; recusa fora de 1 a 99', async () => {
  const res = await GET_PERCENTIL(new Request('http://localhost/percentil?p=73'))
  expect(res.status).toBe(200)
  expect(res.headers.get('content-type')).toBe('image/png')
  const png = Buffer.from(await res.arrayBuffer())
  expect(png.readUInt32BE(16)).toBe(1080)
  expect(png.readUInt32BE(20)).toBe(1920)
  writeFileSync('.superpowers/sdd/2026-10-23-compartilhar-sem-placar/percentil.png', png)
  for (const p of ['0', '100', 'x', '']) {
    expect((await GET_PERCENTIL(new Request(`http://localhost/percentil?p=${p}`))).status).toBe(400)
  }
})

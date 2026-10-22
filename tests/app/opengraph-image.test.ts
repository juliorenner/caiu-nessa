// @vitest-environment node
import { mkdirSync, writeFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import Image, { alt, contentType, size } from '@/app/opengraph-image'

it('gera PNG 1200×630', async () => {
  const res = await Image()
  expect(res.headers.get('content-type')).toBe('image/png')
  const png = Buffer.from(await res.arrayBuffer())
  expect(png.readUInt32BE(16)).toBe(1200)
  expect(png.readUInt32BE(20)).toBe(630)
  expect(size).toEqual({ width: 1200, height: 630 })
  expect(contentType).toBe('image/png')
  expect(alt).toContain('cheira mal')
  // Cópia para conferência visual (fora do repositório versionado).
  mkdirSync('.superpowers/sdd/2026-10-22-compartilhar', { recursive: true })
  writeFileSync('.superpowers/sdd/2026-10-22-compartilhar/og.png', png)
})

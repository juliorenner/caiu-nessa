import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

it('icon.svg usa tinta sobre papel, sem o rosa antigo', () => {
  const svg = readFileSync('src/app/icon.svg', 'utf8')
  expect(svg).not.toMatch(/#be123c/i)
  expect(svg).toMatch(/#1b1540/i)
  expect(svg).toMatch(/#fff3dc/i)
})

it('favicon.ico tem 3 imagens PNG e apple-icon tem 180 px', () => {
  const ico = readFileSync('src/app/favicon.ico')
  expect(ico.readUInt16LE(4)).toBe(3)
  const assinaturaPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  for (let i = 0; i < 3; i++) {
    const entrada = 6 + 16 * i
    const deslocamento = ico.readUInt32LE(entrada + 12)
    expect(ico.subarray(deslocamento, deslocamento + 8), `imagem ${i} é PNG`).toEqual(assinaturaPng)
    expect([16, 32, 48]).toContain(ico.readUInt8(entrada))
  }
  const png = readFileSync('src/app/apple-icon.png')
  expect(png.readUInt32BE(16)).toBe(180) // largura no IHDR
  expect(png.readUInt32BE(20)).toBe(180)
})

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
  const png = readFileSync('src/app/apple-icon.png')
  expect(png.readUInt32BE(16)).toBe(180) // largura no IHDR
  expect(png.readUInt32BE(20)).toBe(180)
})

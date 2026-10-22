import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, it } from 'vitest'

const RAIZ = join(__dirname, '..', '..')
const css = readFileSync(join(RAIZ, 'src/app/globals.css'), 'utf8')

// Só o bloco `@theme { … }` (não o `@theme inline` das fontes).
const tema = css.match(/@theme\s*\{([^}]*)\}/)?.[1] ?? ''
const cores: Record<string, string> = Object.fromEntries(
  [...tema.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, nome, hex]) => [nome, hex.toLowerCase()]),
)

// Contraste WCAG 2 a partir da luminância relativa sRGB.
function luminancia(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contraste(a: string, b: string) {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (claro + 0.05) / (escuro + 0.05)
}

function arquivos(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const caminho = join(dir, e.name)
    if (e.isDirectory()) return arquivos(caminho)
    return /\.(ts|tsx|css|svg)$/.test(e.name) ? [caminho] : []
  })
}

it('tokens têm os hex do design', () => {
  expect(cores).toMatchObject({
    fundo: '#fff3dc',
    tinta: '#1b1540',
    papel: '#ffe8b5',
    verdade: '#1d4ed8',
    mentira: '#be185d',
    cheira: '#c2410c',
    'fundo-escuro': '#120f2b',
  })
})

it('texto ≥ 4,5:1 nos pares do design', () => {
  const pares = [
    ['tinta', 'fundo'],
    ['tinta', 'superficie'],
    ['tinta', 'papel'],
    ['secundario', 'superficie'],
    ['secundario', 'fundo'],
    ['papel', 'fundo-escuro'],
    ['secundario-escuro', 'fundo-escuro'],
    ['verdade-claro', 'fundo-escuro'],
    ['mentira-claro', 'fundo-escuro'],
    ['cheira-claro', 'fundo-escuro'],
    ['verdade', 'superficie'],
    ['mentira', 'superficie'],
    ['cheira', 'superficie'],
  ]
  for (const [a, b] of pares) expect(contraste(cores[a], cores[b]), `${a} sobre ${b}`).toBeGreaterThanOrEqual(4.5)
  for (const v of ['verdade', 'mentira', 'cheira'])
    expect(contraste('#ffffff', cores[v]), `branco sobre ${v}`).toBeGreaterThanOrEqual(4.5)
})

it('nenhuma cor de partido em src/', () => {
  const proibidas = [
    /\b(?:bg|text|border|ring|outline|from|to|via|fill|stroke|shadow)-(?:emerald|green|lime|rose|red|amber|yellow)-\d/,
    /#be123c/i,
  ]
  const ocorrencias = arquivos(join(RAIZ, 'src')).flatMap((caminho) =>
    readFileSync(caminho, 'utf8')
      .split('\n')
      .flatMap((linha, i) =>
        proibidas.some((re) => re.test(linha)) ? [`${caminho.slice(RAIZ.length + 1)}:${i + 1}`] : [],
      ),
  )
  expect(ocorrencias).toEqual([])
})
